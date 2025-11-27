import { FirstAidCategory, FirstAidInstruction } from '../../types';
import { cache } from '../../lib/utils/cache';

export const firstAidCategories: FirstAidCategory[] = [
    { id: 'burns', name: 'Burns', icon: '🔥', color: '#FF6B6B' },
    { id: 'bleeding', name: 'Bleeding', icon: '🩸', color: '#FF4757' },
    { id: 'choking', name: 'Choking', icon: '😷', color: '#FF6348' },
    { id: 'fever', name: 'Fever', icon: '🌡️', color: '#FFA502' },
    { id: 'allergies', name: 'Allergies', icon: '🤧', color: '#FFC312' },
    { id: 'fracture', name: 'Fracture', icon: '🦴', color: '#C44569' },
    { id: 'poisoning', name: 'Poisoning', icon: '☠️', color: '#6C5CE7' },
    { id: 'unconscious', name: 'Unconscious', icon: '😴', color: '#A29BFE' },
];

export const firstAidInstructions: FirstAidInstruction[] = [
    {
        id: 'burns-1',
        category: 'burns',
        title: 'First Degree Burns',
        steps: [
            'Cool the burn immediately with cool (not cold) running water for at least 10 minutes',
            'Remove any tight clothing or jewelry near the burn',
            'Cover the burn with a sterile, non-adhesive bandage or clean cloth',
            'Take over-the-counter pain relievers if needed',
            'Do not apply ice, butter, or ointments to the burn'
        ],
        warnings: ['Seek medical help if the burn is larger than 3 inches or on face, hands, feet, or genitals'],
        whenToSeekHelp: 'If the burn is severe, covers a large area, or shows signs of infection'
    },
    {
        id: 'burns-2',
        category: 'burns',
        title: 'Second and Third Degree Burns',
        steps: [
            'Call emergency services immediately',
            'Do not remove clothing stuck to the burn',
            'Elevate the burned area if possible',
            'Cover with a clean, dry cloth',
            'Monitor for signs of shock'
        ],
        warnings: ['Never apply ice, water, or any ointments to severe burns'],
        whenToSeekHelp: 'Always seek immediate medical attention for second and third degree burns'
    },
    {
        id: 'bleeding-1',
        category: 'bleeding',
        title: 'Minor Cuts and Scrapes',
        steps: [
            'Wash your hands before treating the wound',
            'Apply gentle pressure with a clean cloth or bandage',
            'Clean the wound with running water',
            'Apply an antibiotic ointment',
            'Cover with a sterile bandage'
        ],
        warnings: ['Change the bandage daily or when it becomes wet or dirty'],
        whenToSeekHelp: 'If bleeding does not stop after 10 minutes of pressure'
    },
    {
        id: 'bleeding-2',
        category: 'bleeding',
        title: 'Severe Bleeding',
        steps: [
            'Call emergency services immediately',
            'Apply direct pressure to the wound with a clean cloth',
            'Elevate the injured area above the heart if possible',
            'Do not remove objects embedded in the wound',
            'Keep the person calm and lying down'
        ],
        warnings: ['Do not use a tourniquet unless trained to do so'],
        whenToSeekHelp: 'Always seek immediate medical attention for severe bleeding'
    },
    {
        id: 'choking-1',
        category: 'choking',
        title: 'Adult Choking',
        steps: [
            'Encourage the person to cough if they can',
            'If unable to cough, perform the Heimlich maneuver',
            'Stand behind the person and wrap arms around their waist',
            'Make a fist and place it above the navel',
            'Thrust inward and upward with quick, forceful movements',
            'Repeat until the object is expelled or person becomes unconscious'
        ],
        warnings: ['Call emergency services if the person becomes unconscious'],
        whenToSeekHelp: 'If the person cannot breathe, speak, or cough, call emergency services immediately'
    },
    {
        id: 'choking-2',
        category: 'choking',
        title: 'Infant Choking',
        steps: [
            'Hold the infant face down on your forearm',
            'Support the head and neck with your hand',
            'Give 5 firm back blows between the shoulder blades',
            'Turn the infant face up and give 5 chest thrusts',
            'Alternate between back blows and chest thrusts',
            'Call emergency services if the infant becomes unconscious'
        ],
        warnings: ['Never perform the Heimlich maneuver on infants'],
        whenToSeekHelp: 'If the infant cannot breathe or becomes unconscious, call emergency services immediately'
    },
    {
        id: 'fever-1',
        category: 'fever',
        title: 'Managing Fever',
        steps: [
            'Rest and stay hydrated',
            'Take over-the-counter fever reducers (acetaminophen or ibuprofen)',
            'Apply cool compresses to forehead and body',
            'Wear light clothing',
            'Take a lukewarm bath (not cold)'
        ],
        warnings: ['Do not give aspirin to children or teenagers'],
        whenToSeekHelp: 'If fever is above 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe symptoms'
    },
    {
        id: 'allergies-1',
        category: 'allergies',
        title: 'Mild Allergic Reaction',
        steps: [
            'Remove the allergen if possible',
            'Take an antihistamine if available',
            'Apply a cool compress to reduce itching',
            'Monitor for worsening symptoms',
            'Rest in a comfortable position'
        ],
        warnings: ['Watch for signs of anaphylaxis'],
        whenToSeekHelp: 'If symptoms worsen or breathing becomes difficult, seek immediate medical attention'
    },
    {
        id: 'allergies-2',
        category: 'allergies',
        title: 'Severe Allergic Reaction (Anaphylaxis)',
        steps: [
            'Call emergency services immediately',
            'Use an epinephrine auto-injector if available',
            'Lie down with legs elevated',
            'Loosen tight clothing',
            'Monitor breathing and pulse'
        ],
        warnings: ['This is a medical emergency requiring immediate treatment'],
        whenToSeekHelp: 'Always seek immediate medical attention for anaphylaxis'
    },
    {
        id: 'fracture-1',
        category: 'fracture',
        title: 'Suspected Fracture',
        steps: [
            'Keep the injured area still',
            'Apply ice wrapped in a cloth to reduce swelling',
            'Elevate the injured limb if possible',
            'Do not try to realign the bone',
            'Immobilize the area with a splint if trained to do so'
        ],
        warnings: ['Do not move the person if there is a suspected neck or back injury'],
        whenToSeekHelp: 'Seek immediate medical attention for all suspected fractures'
    },
    {
        id: 'poisoning-1',
        category: 'poisoning',
        title: 'Poisoning',
        steps: [
            'Call poison control center or emergency services',
            'Do not induce vomiting unless instructed',
            'If the person is unconscious, check breathing and pulse',
            'If conscious, have them rinse mouth with water',
            'Save the container or substance for identification'
        ],
        warnings: ['Do not give anything by mouth unless instructed by medical professionals'],
        whenToSeekHelp: 'Always seek immediate medical attention for poisoning'
    },
    {
        id: 'unconscious-1',
        category: 'unconscious',
        title: 'Unconscious Person',
        steps: [
            'Check for responsiveness by tapping and shouting',
            'Call emergency services immediately',
            'Check for breathing and pulse',
            'If not breathing, begin CPR if trained',
            'If breathing, place in recovery position',
            'Keep the person warm and monitor until help arrives'
        ],
        warnings: ['Do not give anything by mouth to an unconscious person'],
        whenToSeekHelp: 'Always seek immediate medical attention for an unconscious person'
    },
];

/**
 * Get first aid data (with offline caching)
 */
export const getFirstAidData = async (): Promise<{ categories: FirstAidCategory[]; instructions: FirstAidInstruction[] }> => {
    try {
        // Try cache first
        const cached = await cache.getFirstAid();
        if (cached && !navigator.onLine) {
            return cached;
        }

        const data = {
            categories: firstAidCategories,
            instructions: firstAidInstructions,
        };

        // Cache the data
        await cache.setFirstAid(data);

        return data;
    } catch (error) {
        console.error('Error getting first aid data:', error);
        // Return cached data on error
        const cached = await cache.getFirstAid();
        return cached || { categories: firstAidCategories, instructions: firstAidInstructions };
    }
};

/**
 * Get instructions by category
 */
export const getInstructionsByCategory = async (categoryId: string): Promise<FirstAidInstruction[]> => {
    const data = await getFirstAidData();
    return data.instructions.filter(inst => inst.category === categoryId);
};

/**
 * Search first aid instructions
 */
export const searchFirstAid = async (query: string): Promise<FirstAidInstruction[]> => {
    const data = await getFirstAidData();
    const lowerQuery = query.toLowerCase();
    return data.instructions.filter(inst => 
        inst.title.toLowerCase().includes(lowerQuery) ||
        inst.steps.some(step => step.toLowerCase().includes(lowerQuery))
    );
};

