import { useState, useEffect } from 'react';

export const useSupportId = () => {
    const [supportId, setSupportId] = useState<string>('');

    useEffect(() => {
        let id = localStorage.getItem('support_id');
        if (!id) {
            id = `LP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            localStorage.setItem('support_id', id);
        }
        setSupportId(id);
    }, []);

    return supportId;
};
