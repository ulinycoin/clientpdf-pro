import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/hooks/useI18n';
import { sendFeedback } from '@/services/feedback';
import { toast } from 'sonner';
import { MessageSquare, Star, Send, Loader2 } from 'lucide-react';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supportId: string;
    currentTool?: string;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
    open,
    onOpenChange,
    supportId,
    currentTool,
}) => {
    const { t } = useI18n();
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error(t('common.ratingRequired') || 'Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            await sendFeedback({
                rating,
                comment,
                email,
                supportId,
                tool: currentTool,
            });
            toast.success(t('common.feedbackSuccess'));
            setRating(0);
            setComment('');
            setEmail('');
            onOpenChange(false);
        } catch (error) {
            toast.error(t('common.feedbackError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-ocean-500" />
                        {t('common.feedbackTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('common.feedbackDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            {t('common.rating')} <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`p-1 transition-all transform hover:scale-110 ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                        }`}
                                >
                                    <Star size={28} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">{t('common.comment')}</Label>
                        <Textarea
                            id="comment"
                            placeholder={t('common.commentPlaceholder') || 'What can we improve?'}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="resize-none min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">{t('common.email')} ({t('common.optional')})</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-gray-50 dark:bg-white/5 p-2 rounded-md border border-gray-100 dark:border-white/10">
                            <span className="font-bold uppercase tracking-wider">Support ID:</span>
                            <code className="text-ocean-600 dark:text-ocean-400 font-mono">{supportId}</code>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-ocean-600 hover:bg-ocean-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('common.sending') || 'Sending...'}
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    {t('common.sendFeedback')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
