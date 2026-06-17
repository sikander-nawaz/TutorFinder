import type { Request, Response, NextFunction } from "express";
import { requestRepository } from "../repositories/requestRepository.js";
import { sendSuccess } from "../utils/response.js";
import { BadRequestError } from "../utils/errors.js";

export const earningsController = {
  async getTutorEarnings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      
      // Get all completed requests for this tutor
      const requests = await requestRepository.findByTutorId(req.userId);
      
      const completedRequests = requests.filter(r => r.status === "completed");
      const thisMonthRequests = completedRequests.filter(r => {
        const requestMonth = new Date(r.createdAt).getMonth();
        const requestYear = new Date(r.createdAt).getFullYear();
        const now = new Date();
        return requestMonth === now.getMonth() && requestYear === now.getFullYear();
      });
      
      const totalEarned = completedRequests.reduce((sum, r) => sum + r.fee, 0);
      const thisMonth = thisMonthRequests.reduce((sum, r) => sum + r.fee, 0);
      
      // Calculate monthly data (last 6 months)
      const monthlyData: { month: string; amount: number; sessions: number }[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleString("default", { month: "short" });
        const yearKey = date.getFullYear();
        
        const monthRequests = completedRequests.filter(r => {
          const rDate = new Date(r.createdAt);
          return rDate.getMonth() === date.getMonth() && rDate.getFullYear() === yearKey;
        });
        
        monthlyData.push({
          month: monthKey,
          amount: monthRequests.reduce((sum, r) => sum + r.fee, 0),
          sessions: monthRequests.length,
        });
      }
      
      sendSuccess({
        res,
        data: {
          totalEarned,
          thisMonth,
          pendingPayouts: 0, // TODO: Implement payout system
          completedSessions: completedRequests.length,
          monthlyData,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
