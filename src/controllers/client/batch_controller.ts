import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger/winston/logger';

// Mock batch usage data
let batchUsageData: any[] = [];

const createBatch = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const user = req.user as any;
        const { name, type, description } = req.body;

        const batchData = {
            batch_id: Math.floor(Math.random() * 10000),
            name: name,
            type: type || 'video',
            status: 'pending',
            created_at: new Date().toISOString(),
            user_id: user.id,
        };

        res.status(200).json({
            status: 'success',
            message: 'Batch created successfully',
            data: batchData,
        });
    } catch (err: any) {
        logger.error(`Create batch error. ${err.message}`);
        next(err);
    }
};

const getMonthlyUsage = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const user = req.user as any;
        const currentDate = new Date();
        const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

        // Mock usage data
        const mockUsage = [
            {
                batch_name: 'my-video-batch-001',
                batch_type: 'video',
                usage_type: 'local_rendering',
                usage_amount: 1,
                completed_at: new Date().toISOString(),
                metadata: {
                    video_count: 5,
                    processing_time: '2 minutes',
                },
            },
            {
                batch_name: 'my-video-batch-002',
                batch_type: 'video',
                usage_type: 'ai_voiceover',
                usage_amount: 1,
                completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                metadata: {
                    video_count: 3,
                    processing_time: '1.5 minutes',
                },
            },
        ];

        const responseData = {
            month_year: monthYear,
            total_batches: mockUsage.length,
            usage_by_type: {
                local_rendering: mockUsage.filter((u) => u.usage_type === 'local_rendering').length,
                ai_voiceover: mockUsage.filter((u) => u.usage_type === 'ai_voiceover').length,
            },
            all_usage: mockUsage,
        };

        res.status(200).json({
            status: 'success',
            message: 'Monthly usage retrieved successfully',
            data: responseData,
        });
    } catch (err: any) {
        logger.error(`Get monthly usage error. ${err.message}`);
        next(err);
    }
};

export default {
    createBatch,
    getMonthlyUsage,
};
