export interface FeedbackData {
    rating: number;
    comment: string;
    email?: string;
    supportId: string;
    tool?: string;
}

export const sendFeedback = async (data: FeedbackData): Promise<void> => {
    const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send feedback');
    }
};
