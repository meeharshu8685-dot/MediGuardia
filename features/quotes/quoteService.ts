import { collection, query, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Quote } from '../../types';
import { cache } from '../../lib/utils/cache';

// Default motivational quotes and positive thoughts
const defaultQuotes: Quote[] = [
    { id: '1', text: 'Your health is an investment, not an expense.', author: 'Unknown' },
    { id: '2', text: 'Take care of your body. It\'s the only place you have to live.', author: 'Jim Rohn' },
    { id: '3', text: 'The greatest wealth is health.', author: 'Virgil' },
    { id: '4', text: 'Healing is a matter of time, but it is sometimes also a matter of opportunity.', author: 'Hippocrates' },
    { id: '5', text: 'The first wealth is health.', author: 'Ralph Waldo Emerson' },
    { id: '6', text: 'Health is not valued till sickness comes.', author: 'Thomas Fuller' },
    { id: '7', text: 'A healthy outside starts from the inside.', author: 'Robert Urich' },
    { id: '8', text: 'To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.', author: 'Buddha' },
    { id: '9', text: 'The doctor of the future will give no medicine, but will interest his patients in the care of the human frame.', author: 'Thomas Edison' },
    { id: '10', text: 'It is health that is real wealth and not pieces of gold and silver.', author: 'Mahatma Gandhi' },
    { id: '11', text: 'Every day is a fresh start. Your health journey begins now.', author: 'Unknown' },
    { id: '12', text: 'Small steps every day lead to big changes over time.', author: 'Unknown' },
    { id: '13', text: 'Your body can do it. It\'s your mind you need to convince.', author: 'Unknown' },
    { id: '14', text: 'Progress, not perfection. Every healthy choice counts.', author: 'Unknown' },
    { id: '15', text: 'You are stronger than you think. You are healthier than you believe.', author: 'Unknown' },
    { id: '16', text: 'Wellness is the complete integration of body, mind, and spirit.', author: 'Greg Anderson' },
    { id: '17', text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
    { id: '18', text: 'Take care of your mind, your body will thank you. Take care of your body, your mind will thank you.', author: 'Debbie Hampton' },
    { id: '19', text: 'Health is a state of complete harmony of the body, mind and spirit.', author: 'B.K.S. Iyengar' },
    { id: '20', text: 'The part can never be well unless the whole is well.', author: 'Plato' },
    { id: '21', text: 'Every moment is a fresh beginning. Start your health journey today.', author: 'Unknown' },
    { id: '22', text: 'Your health is your most valuable possession. Guard it with your life.', author: 'Unknown' },
    { id: '23', text: 'The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison.', author: 'Ann Wigmore' },
    { id: '24', text: 'Rest when you\'re weary. Refresh and renew yourself, your body, your mind, your spirit.', author: 'Ralph Marston' },
    { id: '25', text: 'The greatest healing therapy is friendship and love.', author: 'Hubert H. Humphrey' },
    { id: '26', text: 'Healing takes time, and asking for help is a courageous step.', author: 'Unknown' },
    { id: '27', text: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
    { id: '28', text: 'The body achieves what the mind believes.', author: 'Unknown' },
    { id: '29', text: 'Self-care is not selfish. You cannot serve from an empty vessel.', author: 'Eleanor Brownn' },
    { id: '30', text: 'Your health is your crown. Only the sick know its value.', author: 'Unknown' },
    { id: '31', text: 'Every day is a new opportunity to make healthy choices.', author: 'Unknown' },
    { id: '32', text: 'The secret of health for both mind and body is not to mourn for the past, worry about the future, but to live the present moment wisely.', author: 'Buddha' },
    { id: '33', text: 'Healing is a journey, not a destination.', author: 'Unknown' },
    { id: '34', text: 'Your body hears everything your mind says. Stay positive.', author: 'Unknown' },
    { id: '35', text: 'The best way to find out if you can trust somebody is to trust them.', author: 'Ernest Hemingway' },
    { id: '36', text: 'Health and cheerfulness naturally beget each other.', author: 'Joseph Addison' },
    { id: '37', text: 'The greatest medicine of all is teaching people how not to need it.', author: 'Hippocrates' },
    { id: '38', text: 'Take time to do what makes your soul happy.', author: 'Unknown' },
    { id: '39', text: 'Your health is an investment, not an expense. Invest wisely.', author: 'Unknown' },
    { id: '40', text: 'The only bad workout is the one that didn\'t happen.', author: 'Unknown' },
    { id: '41', text: 'You are one decision away from a completely different life.', author: 'Unknown' },
    { id: '42', text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
    { id: '43', text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
    { id: '44', text: 'You are braver than you believe, stronger than you seem, and smarter than you think.', author: 'A.A. Milne' },
    { id: '45', text: 'Every accomplishment starts with the decision to try.', author: 'Unknown' },
    { id: '46', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { id: '47', text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
    { id: '48', text: 'You have power over your mind - not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
    { id: '49', text: 'The only person you are destined to become is the person you decide to be.', author: 'Ralph Waldo Emerson' },
    { id: '50', text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
];

/**
 * Get quotes from Firestore (with offline caching)
 */
export const getQuotes = async (): Promise<Quote[]> => {
    try {
        // Try cache first
        const cached = await cache.getQuotes();
        if (cached && !navigator.onLine) {
            return cached;
        }

        const quotesRef = collection(db, 'quotes');
        const q = query(quotesRef, orderBy('createdAt', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);

        const quotes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Quote[];

        // Cache quotes
        await cache.setQuotes(quotes);

        // If we have quotes from Firebase, combine with defaults, otherwise use defaults
        return quotes.length > 0 ? [...quotes, ...defaultQuotes] : defaultQuotes;
    } catch (error) {
        console.error('Error fetching quotes:', error);
        // Try cache on error
        const cached = await cache.getQuotes();
        return cached && cached.length > 0 ? cached : defaultQuotes;
    }
};

/**
 * Get random quote (ensures different quote each time)
 */
export const getRandomQuote = async (): Promise<Quote | null> => {
    try {
        const quotes = await getQuotes();
        if (quotes.length === 0) {
            // Return default quote if none available
            return defaultQuotes[0];
        }
        
        // Get a random quote, ensuring it's different from the last one if stored
        const lastQuoteId = localStorage.getItem('lastQuoteId');
        let availableQuotes = quotes;
        
        // Filter out last quote if we have more than one quote
        if (lastQuoteId && quotes.length > 1) {
            availableQuotes = quotes.filter(q => q.id !== lastQuoteId);
        }
        
        const randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
        
        // Store the selected quote ID
        if (randomQuote) {
            localStorage.setItem('lastQuoteId', randomQuote.id);
        }
        
        return randomQuote;
    } catch (error) {
        console.error('Error getting random quote:', error);
        // Return a random default quote
        const randomDefault = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
        return randomDefault;
    }
};

