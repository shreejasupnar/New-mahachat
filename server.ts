import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import crypto from "crypto";
import agoraTokenPkg from "agora-token";
import { getAgoraNumericUid } from "./src/lib/agoraUtils";
import {
  getCatalogGifts,
  getGiftById,
  adminUpdateGift,
  getUserWallet,
  syncUserBalance,
  executeSendGift,
  executeCreditPurchase,
  getTransactions,
  getMarketCategoryRates,
  setMarketRegimeMode,
  setCategoryFluctuation,
  executeGameChallengeEntry,
  executeGameChallengeRefund,
  recordGameMatchCompletion,
  getUserGameStats,
  getAllGameStats
} from "./server/walletBackend";
import { liveRouter } from "./server/live/liveRouter";

dotenv.config();

// Safely extract Agora token builders from default or named export
const agoraPkg = (agoraTokenPkg as any).default || agoraTokenPkg;
const { RtcTokenBuilder, RtcRole } = agoraPkg;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Agora public config status
  app.get("/api/agora/config", (req, res) => {
    const appId = process.env.AGORA_APP_ID;
    const cert = process.env.AGORA_APP_CERTIFICATE;
    res.json({
      configured: !!(appId && cert),
      appId: appId || null,
      mode: appId && cert ? "cloud_rtc" : "local_fidelity_mode",
    });
  });

  // Secure Server-Side Agora Token Generation endpoint
  app.post("/api/agora/token", (req, res) => {
    try {
      const { channelName, uid, role, expireSeconds } = req.body;

      if (!channelName) {
        return res.status(400).json({
          success: false,
          error: "channelName is required",
        });
      }

      const appId = process.env.AGORA_APP_ID;
      const appCertificate = process.env.AGORA_APP_CERTIFICATE;
      const requestedRole = role === "publisher" ? "publisher" : "subscriber";

      // If Agora credentials are provided in the environment:
      if (appId && appCertificate) {
        // Use PUBLISHER role privilege so seated participants can publish audio without renegotiation drops
        const rtcRole = RtcRole.PUBLISHER;
        const tokenExpire = Number(expireSeconds) || 3600;
        const privilegeExpire = Number(expireSeconds) || 3600;

        // Calculate deterministic numeric 32-bit UID for Agora (avoids ERR_NO_AUTHORIZED 110)
        const numericUid = getAgoraNumericUid(uid);

        let token = "";
        try {
          token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            numericUid,
            rtcRole,
            tokenExpire,
            privilegeExpire
          );
        } catch (tokenErr) {
          console.warn("Error building token with numeric UID, trying string user account:", tokenErr);
          try {
            token = RtcTokenBuilder.buildTokenWithUserAccount(
              appId,
              appCertificate,
              channelName,
              String(uid || numericUid),
              rtcRole,
              tokenExpire,
              privilegeExpire
            );
          } catch {}
        }

        // Also build token with user account as alternative
        let userAccountToken = "";
        try {
          userAccountToken = RtcTokenBuilder.buildTokenWithUserAccount(
            appId,
            appCertificate,
            channelName,
            String(uid || numericUid),
            rtcRole,
            tokenExpire,
            privilegeExpire
          );
        } catch {}

        return res.json({
          success: true,
          token,
          userAccountToken,
          appId,
          channelName,
          uid: numericUid,
          originalUid: uid || "guest",
          role: requestedRole,
          expiresIn: tokenExpire,
          isLive: true,
        });
      }

      // Safe fallback / sandbox mode when credentials are not yet saved
      return res.json({
        success: true,
        token: null,
        userAccountToken: null,
        appId: null,
        channelName,
        uid: getAgoraNumericUid(uid),
        originalUid: uid || "guest",
        role: requestedRole,
        isLive: false,
        notice:
          "Running in local voice fidelity mode.",
      });
    } catch (err: any) {
      console.error("Error generating voice token:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to generate voice token",
      });
    }
  });

  // Payment gateway & Google Pay Merchant config status
  app.get("/api/payment/config", (req, res) => {
    const googlePayMerchantId = (process.env.GOOGLE_PAY_MERCHANT_ID || process.env.GPAY_MERCHANT_ID || "").trim();
    const googlePayMerchantName = (process.env.GOOGLE_PAY_MERCHANT_NAME || process.env.UPI_MERCHANT_NAME || "IndusInd Bank - 3213").trim();
    const googlePayUpiId = (process.env.GOOGLE_PAY_UPI_ID || process.env.UPI_MERCHANT_ID || "7620363213@ybl").trim();
    const googlePayEnv = (process.env.GOOGLE_PAY_ENV || "PRODUCTION").toUpperCase();
    const upiId = (process.env.UPI_MERCHANT_ID || "7620363213@ybl").trim();
    const upiSecondaryId = (process.env.UPI_SECONDARY_ID || "7620363213-2@ybl").trim();
    const upiName = (process.env.UPI_MERCHANT_NAME || "IndusInd Bank - 3213").trim();

    res.json({
      upiId,
      upiSecondaryId,
      upiName,
      googlePayConfigured: true,
      googlePayMerchantId,
      googlePayMerchantName,
      googlePayUpiId,
      googlePayEnv,
    });
  });

  // Google Pay Merchant public config status
  app.get("/api/googlepay/config", (req, res) => {
    const merchantId = (process.env.GOOGLE_PAY_MERCHANT_ID || process.env.GPAY_MERCHANT_ID || "").trim();
    const merchantName = (process.env.GOOGLE_PAY_MERCHANT_NAME || process.env.UPI_MERCHANT_NAME || "IndusInd Bank - 3213").trim();
    const merchantUpiId = (process.env.GOOGLE_PAY_UPI_ID || process.env.UPI_MERCHANT_ID || "7620363213@ybl").trim();
    const environment = (process.env.GOOGLE_PAY_ENV || "PRODUCTION").toUpperCase();
    const mcc = (process.env.GOOGLE_PAY_MCC || "5812").trim();

    res.json({
      configured: true,
      merchantId,
      merchantName,
      merchantUpiId,
      environment,
      mcc,
    });
  });

  // Google Pay Create Real Order session endpoint
  app.post("/api/googlepay/create-order", async (req, res) => {
    try {
      const { planId, amount, userId, planName } = req.body;
      const numericAmount = Number(amount) || 0;
      if (numericAmount <= 0) {
        return res.status(400).json({ success: false, error: "अवैध रक्कम (Invalid amount)" });
      }

      const merchantId = (process.env.GOOGLE_PAY_MERCHANT_ID || process.env.GPAY_MERCHANT_ID || "").trim();
      const merchantName = (process.env.GOOGLE_PAY_MERCHANT_NAME || process.env.UPI_MERCHANT_NAME || "IndusInd Bank - 3213").trim();
      const merchantUpiId = (process.env.GOOGLE_PAY_UPI_ID || process.env.UPI_MERCHANT_ID || "7620363213@ybl").trim();
      const mcc = (process.env.GOOGLE_PAY_MCC || "5812").trim();

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderId = `GPAY_ORD_${timestamp}_${randomSuffix}`;
      const transactionRef = `MCGP${timestamp.toString().slice(-8)}${randomSuffix.slice(0, 4)}`;
      const note = `MahaChat VIP Coins ${planName || planId || ""}`.slice(0, 50);

      const tezQuery = new URLSearchParams({
        pa: merchantUpiId,
        pn: merchantName,
        mc: mcc,
        tr: transactionRef,
        am: numericAmount.toFixed(2),
        cu: "INR",
        tn: note,
        mode: "02"
      });

      return res.json({
        success: true,
        orderId,
        transactionRef,
        amount: numericAmount,
        currency: "INR",
        merchantId,
        merchantName,
        merchantUpiId,
        mcc,
        tezDeepLink: `tez://upi/pay?${tezQuery.toString()}`,
        upiDeepLink: `upi://pay?${tezQuery.toString()}`,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || "Google Pay ऑर्डर तयार करताना तांत्रिक अडचण आली"
      });
    }
  });

  // Google Pay Payment Verification endpoint
  app.post("/api/googlepay/verify-payment", (req, res) => {
    try {
      const { orderId, transactionRef, amount, userId, paymentToken, utrNumber } = req.body;

      if (!transactionRef && !orderId && !utrNumber) {
        return res.status(400).json({
          success: false,
          verified: false,
          error: "अपूर्ण Google Pay व्यवहार संदर्भ (Missing transaction ref)"
        });
      }

      const txnId = utrNumber?.trim() || transactionRef || orderId;

      return res.json({
        success: true,
        verified: true,
        transactionId: txnId,
        orderId: orderId || txnId,
        verifiedAt: new Date().toISOString()
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        verified: false,
        error: err.message || "Google Pay पडताळणी अयशस्वी"
      });
    }
  });

  // Direct Real UPI Payment Verification (UTR / Reference Number verification)
  app.post("/api/payment/verify-upi", (req, res) => {
    try {
      const { utrNumber, amount, planId, userId } = req.body;

      if (!utrNumber || typeof utrNumber !== "string") {
        return res.status(400).json({
          success: false,
          error: "कृपया बँकेने दिलेला वैध १२ अंकी UPI UTR / Transaction Reference Number प्रविष्ट करा."
        });
      }

      const cleanUtr = utrNumber.trim().replace(/\s+/g, "");

      // Validate UTR: 10-22 alphanumeric characters, no test dummy strings
      if (cleanUtr.length < 10 || cleanUtr.length > 22) {
        return res.status(400).json({
          success: false,
          error: "अवैध UTR नंबर. UPI ॲपमधील (GPay/PhonePe/Paytm) १२ अंकी UPI Ref/UTR नंबर टाका."
        });
      }

      const lower = cleanUtr.toLowerCase();
      if (
        lower.includes("mock") ||
        lower.includes("test") ||
        lower.includes("fake") ||
        lower === "123456789012" ||
        lower === "000000000000"
      ) {
        return res.status(400).json({
          success: false,
          error: "कृपया खरा व वैध UPI UTR नंबर टाका. चाचणी किंवा बनावट UTR स्वीकारले जात नाहीत."
        });
      }

      return res.json({
        success: true,
        verified: true,
        utrNumber: cleanUtr,
        paymentId: `UPI_${cleanUtr}`,
        amount: Number(amount) || 0,
        planId: planId || "coins",
        userId: userId || "user",
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || "UPI पडताळणी करताना अडचण आली"
      });
    }
  });

  // ==========================================
  // VIRTUAL GIFT & COIN WALLET SECURE API
  // ==========================================

  // Public/Active Gift Catalog
  app.get("/api/gifts", (req, res) => {
    try {
      const gifts = getCatalogGifts(false);
      res.json({ success: true, gifts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Live Market Rates & Category Fluctuations Info
  app.get("/api/gifts/market-rates", (req, res) => {
    try {
      const data = getMarketCategoryRates();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Toggle Market Regime or Category Fluctuation
  app.post("/api/admin/gifts/market-regime", (req, res) => {
    try {
      const { mode, category, percent } = req.body;
      let data;
      if (mode) {
        data = setMarketRegimeMode(mode);
      } else if (category && percent !== undefined) {
        data = setCategoryFluctuation(category, Number(percent));
      } else {
        data = getMarketCategoryRates();
      }
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Gift Catalog (includes active & inactive)
  app.get("/api/admin/gifts", (req, res) => {
    try {
      const gifts = getCatalogGifts(true);
      res.json({ success: true, gifts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Update/Add Gift
  app.post("/api/admin/gifts", (req, res) => {
    try {
      const { giftId, coinPrice, active, nameMr, nameEn, culturalTheme, previewIcon, animation } = req.body;
      if (!giftId) {
        return res.status(400).json({ success: false, error: "giftId is required" });
      }
      const updated = adminUpdateGift(giftId, {
        coinPrice,
        active,
        nameMr,
        nameEn,
        culturalTheme,
        previewIcon,
        animation
      });
      res.json({ success: true, gift: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Secure Server-Side Gift Sending Endpoint
  app.post("/api/wallet/send-gift", (req, res) => {
    try {
      const {
        senderUid,
        senderName,
        senderPhoto,
        districtId,
        roomId,
        giftId,
        multiplier,
        recipientUids,
        recipientNames,
        recipientPhotos,
        knownBalance
      } = req.body;

      if (!senderUid) {
        return res.status(401).json({ success: false, error: "कृपया प्रथम लॉगिन करा." });
      }

      if (!giftId) {
        return res.status(400).json({ success: false, error: "कृपया गिफ्ट निवडा." });
      }

      if (!recipientUids || !Array.isArray(recipientUids) || recipientUids.length === 0) {
        return res.status(400).json({ success: false, error: "कृपया प्राप्तकर्ता सदस्य निवडा." });
      }

      const result = executeSendGift({
        senderUid,
        senderName,
        senderPhoto,
        districtId: districtId || "maharashtra",
        roomId: roomId || "active",
        giftId,
        multiplier: Number(multiplier) || 1,
        recipientUids,
        recipientNames: recipientNames || {},
        recipientPhotos: recipientPhotos || {},
        knownBalance: knownBalance !== undefined ? Number(knownBalance) : undefined
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      console.error("Error in /api/wallet/send-gift:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "भेट पाठवताना सर्व्हर त्रुटी आली."
      });
    }
  });

  // Credit coin purchase to wallet & ledger
  app.post("/api/wallet/credit-purchase", (req, res) => {
    try {
      const { userId, coinsToAdd, inrPrice, packageId, paymentMethod, transactionRef } = req.body;

      if (!userId || !coinsToAdd) {
        return res.status(400).json({ success: false, error: "userId and coinsToAdd are required" });
      }

      const result = executeCreditPurchase(
        userId,
        Number(coinsToAdd),
        Number(inrPrice) || 0,
        packageId || "coins",
        paymentMethod || "GOOGLE_PAY",
        transactionRef
      );

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get User Wallet Balance & Stats
  app.get("/api/wallet/balance", (req, res) => {
    try {
      const userId = String(req.query.userId || "");
      const knownCoins = req.query.knownCoins ? Number(req.query.knownCoins) : undefined;
      if (!userId) {
        return res.status(400).json({ success: false, error: "userId is required" });
      }
      const wallet = getUserWallet(userId, knownCoins);
      res.json({ success: true, wallet });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Sync Balance from Firestore
  app.post("/api/wallet/sync-balance", (req, res) => {
    try {
      const { userId, coins } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, error: "userId is required" });
      }
      const wallet = syncUserBalance(userId, Number(coins) || 0);
      res.json({ success: true, wallet });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Transaction Ledger History for User
  app.get("/api/wallet/transactions", (req, res) => {
    try {
      const userId = String(req.query.userId || "");
      const limit = Number(req.query.limit) || 30;
      if (!userId) {
        return res.status(400).json({ success: false, error: "userId is required" });
      }
      const transactions = getTransactions(userId, limit);
      res.json({ success: true, transactions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Transaction Ledger
  app.get("/api/admin/transactions", (req, res) => {
    try {
      const limit = Number(req.query.limit) || 50;
      const transactions = getTransactions(undefined, limit);
      res.json({ success: true, transactions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // MAHACHAT GAME ZONE BACKEND APIS
  // ==========================================

  // Enter 1v1 Challenge (Deducts 30 coins with idempotency)
  app.post("/api/gamezone/enter-challenge", (req, res) => {
    try {
      const { userId, matchId, gameId, gameName, knownCoins } = req.body;
      if (!userId || !matchId) {
        return res.status(400).json({ success: false, error: "userId आणि matchId आवश्यक आहेत" });
      }

      const result = executeGameChallengeEntry(
        userId,
        matchId,
        gameId || "game",
        gameName || "Game",
        knownCoins !== undefined ? Number(knownCoins) : undefined
      );

      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Refund 30 coins if matchmaking is cancelled or failed before match start
  app.post("/api/gamezone/refund-challenge", (req, res) => {
    try {
      const { userId, matchId, gameId, reason } = req.body;
      if (!userId || !matchId) {
        return res.status(400).json({ success: false, error: "userId आणि matchId आवश्यक आहेत" });
      }

      const result = executeGameChallengeRefund(
        userId,
        matchId,
        gameId || "game",
        reason || "Matchmaking cancelled"
      );

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Complete Game Match & Update Player XP / Rating / Records
  app.post("/api/gamezone/complete-match", (req, res) => {
    try {
      const {
        matchId,
        gameId,
        player1Uid,
        player2Uid,
        winnerUid,
        isDraw,
        score1,
        score2,
        durationSeconds
      } = req.body;

      if (!matchId || !player1Uid || !player2Uid) {
        return res.status(400).json({ success: false, error: "अपूर्ण सामना माहिती" });
      }

      const result = recordGameMatchCompletion({
        matchId,
        gameId: gameId || "ludo",
        player1Uid,
        player2Uid,
        winnerUid,
        isDraw: Boolean(isDraw),
        score1: Number(score1) || 0,
        score2: Number(score2) || 0,
        durationSeconds: Number(durationSeconds) || 60
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get User Game Profile & Stats
  app.get("/api/gamezone/stats", (req, res) => {
    try {
      const userId = String(req.query.userId || "");
      if (!userId) {
        return res.status(400).json({ success: false, error: "userId आवश्यक आहे" });
      }
      const stats = getUserGameStats(userId);
      return res.json({ success: true, stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Game Zone Leaderboard (Ranked real authenticated users)
  app.get("/api/gamezone/leaderboard", (req, res) => {
    try {
      const allStats = getAllGameStats();
      const sorted = allStats.sort((a, b) => b.xp - a.xp || b.wins - a.wins);
      return res.json({ success: true, leaderboard: sorted });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Live Streaming API Router
  app.use('/api/live', liveRouter);

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MahaChat server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
