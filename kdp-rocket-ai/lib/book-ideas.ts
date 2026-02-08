export type BookType = 'word-search' | 'maze' | 'sudoku' | 'journal' | 'dot-grid';
export type Audience = 'kids-4-6' | 'kids-6-8' | 'kids-8-12' | 'teens' | 'adults' | 'seniors';
export type Theme = 'animals' | 'space' | 'food' | 'travel' | 'nature' | 'fantasy' | 'sports' | 'holidays' | 'ocean' | 'dinosaurs';

export interface BookIdea {
    title: string;
    subtitle: string;
    description: string;
    structure: string;
    pageCountRecommendation: string;
    difficulty?: string;
}

interface Template {
    titleTemplates: string[];
    subtitleTemplates: string[];
    descriptionTemplates: string[];
    structureTemplates: string[];
}

const TEMPLATES: Record<BookType, Partial<Record<Audience, Partial<Record<Theme, Template>>>>> = {
    'word-search': {
        'kids-4-6': {
            'animals': {
                titleTemplates: [
                    'My First Animal Word Search',
                    'Big & Easy Animal Word Hunt',
                    'Cute Animals Word Search for Little Ones'
                ],
                subtitleTemplates: [
                    'Large Print Puzzle Book for Preschoolers Ages 4-6',
                    'Fun Learning Activity Book with Big Letters',
                    'Easy Word Find with Adorable Animal Themes'
                ],
                descriptionTemplates: [
                    'Perfect for young learners! This extra-large print word search book features adorable animals and simple words. Ideal for developing reading skills and hand-eye coordination.',
                    'Engage your preschooler with fun animal-themed puzzles! Each page features large, easy-to-read letters and simple animal names that build confidence and vocabulary.',
                    'Make learning fun with this delightful word search book! Designed specifically for ages 4-6 with big letters, cute illustrations references, and age-appropriate words.'
                ],
                structureTemplates: [
                    '50 puzzles with 5-8 words each, extra-large 12x12 grids, answer key included',
                    '40 themed pages with 4-6 animal words per puzzle, large font, solutions at the back',
                    '60 engaging puzzles, horizontal and vertical words only, oversized print'
                ]
            },
            'space': {
                titleTemplates: [
                    'Space Adventure Word Search for Little Explorers',
                    'My First Space Word Hunt',
                    'Blast Off! Easy Space Word Search'
                ],
                subtitleTemplates: [
                    'Large Print Puzzle Book for Future Astronauts Ages 4-6',
                    'Fun Learning Activities with Planets, Stars & Rockets',
                    'Big Letter Word Find for Preschool Space Fans'
                ],
                descriptionTemplates: [
                    'Launch your child into learning! This space-themed word search introduces simple space vocabulary with extra-large letters perfect for little hands.',
                    'Perfect for aspiring astronauts! Features rockets, planets, and stars in easy-to-find puzzles that build reading confidence.',
                    'Out of this world learning fun! Simple space words in oversized grids make this perfect for early readers.'
                ],
                structureTemplates: [
                    '45 space-themed puzzles, 5-7 words each, 12x12 grids with large font',
                    '50 puzzles featuring planets, rockets, and stars, horizontal/vertical only',
                    '40 engaging pages with simple space vocabulary, answer key included'
                ]
            },
            // Add more themes...
            'food': {
                titleTemplates: [
                    'Yummy Food Word Search for Little Chefs',
                    'My First Food Word Hunt',
                    'Tasty Treats Word Search'
                ],
                subtitleTemplates: [
                    'Large Print Puzzle Book for Kids Ages 4-6',
                    'Fun Learning with Fruits, Veggies & Snacks',
                    'Easy Word Find for Young Food Lovers'
                ],
                descriptionTemplates: [
                    'Deliciously fun learning! Features favorite foods in large, easy-to-read letters perfect for preschoolers.',
                    'Make vocabulary learning tasty! Simple food words in oversized puzzles that kids love.',
                    'Perfect for young learners! Fruits, vegetables, and treats in age-appropriate puzzles.'
                ],
                structureTemplates: [
                    '50 food-themed puzzles, 4-6 words each, extra-large print',
                    '45 puzzles with common foods, horizontal/vertical words only',
                    '60 pages of fun food finds, answer key at the back'
                ]
            }
        },
        'kids-6-8': {
            'animals': {
                titleTemplates: [
                    'Amazing Animal Word Search for Kids',
                    'Wildlife Word Hunt Adventure',
                    'Animal Kingdom Puzzle Book'
                ],
                subtitleTemplates: [
                    'Fun & Challenging Puzzles for Ages 6-8',
                    '50+ Animal-Themed Word Search Activities',
                    'Wild About Words - Animal Edition'
                ],
                descriptionTemplates: [
                    'Discover the animal kingdom while building vocabulary! This engaging word search book features 50+ puzzles with animals from around the world.',
                    'Perfect for young animal lovers! Challenging yet fun puzzles featuring mammals, birds, reptiles, and more. Builds vocabulary and concentration skills.',
                    'An exciting journey through the animal world! Each puzzle introduces new animals and facts, making learning an adventure.'
                ],
                structureTemplates: [
                    '50+ puzzles with 8-12 words each, medium-difficulty grids, includes bonus facts',
                    '60 themed puzzles organized by habitat, diagonal words included, solutions provided',
                    '55 engaging challenges, mix of easy and medium difficulty, fun animal facts'
                ]
            },
            'space': {
                titleTemplates: [
                    'Space Explorer Word Search',
                    'Cosmic Word Hunt for Young Astronauts',
                    'Galaxy Quest Puzzle Book'
                ],
                subtitleTemplates: [
                    'Out-of-This-World Puzzles for Ages 6-8',
                    'Journey Through the Solar System with Word Searches',
                    'Stellar Learning Activities for Future Space Scientists'
                ],
                descriptionTemplates: [
                    'Blast off into vocabulary building! Features planets, constellations, space missions, and more in challenging puzzles.',
                    'Perfect for space enthusiasts! Explore the cosmos while learning astronomical terms in fun, engaging word searches.',
                    'An educational space adventure! Each puzzle teaches new space vocabulary with increasing difficulty levels.'
                ],
                structureTemplates: [
                    '50 cosmic puzzles, 10-14 words each, organized by space topics',
                    '60 challenges featuring planets, stars, and space equipment, diagonal words included',
                    '55 puzzles with space facts, medium difficulty, comprehensive answer key'
                ]
            },
            'dinosaurs': {
                titleTemplates: [
                    'Dinosaur Word Search for Young Paleontologists',
                    'Prehistoric Puzzle Adventure',
                    'Dino-mite Word Hunt'
                ],
                subtitleTemplates: [
                    'Roar-some Puzzles for Dinosaur Fans Ages 6-8',
                    'Travel Back in Time with 50+ Word Searches',
                    'Learn Dinosaur Names the Fun Way'
                ],
                descriptionTemplates: [
                    'Dig into learning! Discover dinosaurs from A to Z while solving engaging word search puzzles.',
                    'Perfect for dino enthusiasts! Features T-Rex, Triceratops, and dozens more prehistoric creatures.',
                    'Make learning prehistoric! Fun facts about each dinosaur included with every puzzle.'
                ],
                structureTemplates: [
                    '50+ puzzles featuring dinosaur names and facts, medium difficulty',
                    '60 challenges organized by dinosaur era, includes pronunciation guides',
                    '55 dino-themed puzzles, bonus trivia questions, solutions included'
                ]
            }
        },
        // More audiences can be added...
        'adults': {
            'travel': {
                titleTemplates: [
                    'World Traveler Word Search',
                    'Around the World in Word Puzzles',
                    'Wanderlust Word Search Collection'
                ],
                subtitleTemplates: [
                    '100 Travel-Themed Puzzles for Adventure Seekers',
                    'Explore Global Destinations Through Word Searches',
                    'A Journey Through Cities, Landmarks & Cultures'
                ],
                descriptionTemplates: [
                    'Explore the world from your armchair! This comprehensive collection features cities, landmarks, and cultural terms from every continent.',
                    'Perfect for travel enthusiasts! Challenge yourself with puzzles featuring destinations, landmarks, and travel vocabulary.',
                    'Feed your wanderlust! Each puzzle takes you to a new destination with medium to challenging difficulty.'
                ],
                structureTemplates: [
                    '100 puzzles organized by continent, 15-20 words each, challenging grids',
                    '80 location-based challenges, includes geographical facts, full answer key',
                    '90 travel-themed puzzles, varying difficulty, bonus trivia about each destination'
                ]
            },
            'nature': {
                titleTemplates: [
                    'Nature Lover\'s Word Search',
                    'Botanical & Wildlife Word Puzzles',
                    'Mother Nature\'s Word Hunt'
                ],
                subtitleTemplates: [
                    '100 Puzzles Celebrating the Natural World',
                    'Flora, Fauna & Landscapes Word Search Collection',
                    'Relax with Nature-Themed Brain Teasers'
                ],
                descriptionTemplates: [
                    'Reconnect with nature through engaging word puzzles! Features plants, animals, ecosystems, and natural phenomena.',
                    'Perfect for nature enthusiasts! Challenging puzzles themed around wildlife, botany, and Earth\'s wonders.',
                    'A peaceful puzzle experience! Each page celebrates the beauty of nature with thoughtfully crafted word searches.'
                ],
                structureTemplates: [
                    '100 nature-themed puzzles, categorized by ecosystem, medium-hard difficulty',
                    '90 challenges featuring flora and fauna, includes nature facts, solutions provided',
                    '85 beautiful puzzles celebrating Earth\'s diversity, bonus fun facts'
                ]
            }
        },
        'seniors': {
            'nature': {
                titleTemplates: [
                    'Large Print Nature Word Search for Seniors',
                    'Relax & Unwind with Nature Puzzles',
                    'Garden & Wildlife Word Search - Large Print'
                ],
                subtitleTemplates: [
                    'Easy-to-Read Puzzles for Relaxation and Mental Exercise',
                    '80 Calming Nature Puzzles with Oversized Print',
                    'Gentle Brain Exercise for Active Seniors'
                ],
                descriptionTemplates: [
                    'Gentle mental exercise with beautiful nature themes! Extra-large print ensures comfortable solving for all vision levels.',
                    'Perfect for relaxation and brain health! Features flowers, birds, trees, and scenic landscapes in easy-to-read puzzles.',
                    'Enjoy puzzle-solving without eye strain! Large fonts, clear layouts, and peaceful nature themes.'
                ],
                structureTemplates: [
                    '80 puzzles with 10-12 words, extra-large 14pt+ font, high-contrast printing',
                    '70 calming nature puzzles, oversized grids, one puzzle per page, solutions in large print',
                    '75 gentle challenges, large clear font, nature facts, easy-to-read answer key'
                ]
            },
            'travel': {
                titleTemplates: [
                    'Large Print Travel Word Search',
                    'Armchair Traveler Puzzle Book - Senior Edition',
                    'World Destinations Word Search for Seniors'
                ],
                subtitleTemplates: [
                    'Easy-to-Read Puzzles Featuring Global Landmarks',
                    '80 Travel Puzzles with Extra-Large Print',
                    'Gentle Brain Exercise with Travel Themes'
                ],
                descriptionTemplates: [
                    'Revisit favorite destinations through comfortable puzzles! Extra-large print perfect for seniors.',
                    'Travel the world from  home! Famous cities, landmarks, and travel terms in easy-to-read format.',
                    'Memory-stirring travel puzzles with vision-friendly large print and one puzzle per page.'
                ],
                structureTemplates: [
                    '80 travel puzzles, extra-large font, high contrast, one per page',
                    '70 destination challenges, oversized print, travel trivia, clear solutions',
                    '75 gentle puzzles featuring beloved destinations, large print throughout'
                ]
            }
        }
    },
    // Similar structure for other book types...
    'maze': {
        'kids-4-6': {
            'animals': {
                titleTemplates: [
                    'Animal Maze Adventures for Little Ones',
                    'Big & Easy Animal Mazes',
                    'Cute Animals Maze Book'
                ],
                subtitleTemplates: [
                    'Simple Mazes for Preschoolers Ages 4-6',
                    'Fun Path-Finding Activities for Young Kids',
                    'Large Print Maze Fun with Adorable Animals'
                ],
                descriptionTemplates: [
                    'Perfect first maze book! Simple paths and cute animal themes build problem-solving skills and hand-eye coordination.',
                    'Help animals find their way home! Easy mazes designed for little hands with large pathways and fun goals.',
                    'Build confidence with every maze! Age-appropriate challenges that grow with your child.'
                ],
                structureTemplates: [
                    '50 simple mazes, wide pathways, one maze per page, starts very easy',
                    '40 animal-themed mazes, progressive difficulty, hints included',
                    '60 fun challenges, large format, solution for every maze'
                ]
            }
        },
        'kids-6-8': {
            'space': {
                titleTemplates: [
                    'Space Maze Missions',
                    'Astronaut Maze Adventure Book',
                    'Navigate the Galaxy - Maze Challenges'
                ],
                subtitleTemplates: [
                    'Exciting Mazes for Young Space Explorers Ages 6-8',
                    '50+ Cosmic Path-Finding Puzzles',
                    'Blast Through Space with Challenging Mazes'
                ],
                descriptionTemplates: [
                    'Pilot your spacecraft through challenging mazes! Features space stations, asteroid fields, and planetary orbits.',
                    'Perfect for space fans! Navigate through the solar system with increasingly challenging maze puzzles.',
                    'Mission control approved! Build problem-solving skills with exciting space-themed mazes.'
                ],
                structureTemplates: [
                    '50+ space mazes, medium difficulty, themed chapters',
                    '60 cosmic challenges, progressive difficulty, mission briefings',
                    '55 mazes with space facts, bonus timed challenges'
                ]
            }
        },
        'adults': {
            'fantasy': {
                titleTemplates: [
                    'Fantasy Realm Maze Collection',
                    'Enchanted Pathways Maze Book',
                    'Epic Maze Adventures'
                ],
                subtitleTemplates: [
                    '100 Challenging Mazes for Fantasy Lovers',
                    'Journey Through Magical Worlds',
                    'Complex Puzzles for the Maze Enthusiast'
                ],
                descriptionTemplates: [
                    'Lose yourself in intricate fantasy mazes! Navigate castles, enchanted forests, and mythical landscapes.',
                    'Perfect for puzzle lovers! Challenging mazes set in richly imagined fantasy worlds.',
                    'Epic adventures in maze form! Each puzzle tells a story as you navigate complex pathways.'
                ],
                structureTemplates: [
                    '100 complex mazes, varying difficulty, fantasy-themed chapters',
                    '80 challenging puzzles, detailed illustrations, timed challenges',
                    '90 intricate mazes, bonus hidden object elements, full solutions'
                ]
            }
        }
    },
    'sudoku': {
        'kids-8-12': {
            'animals': {
                titleTemplates: [
                    'Animal Sudoku for Kids',
                    'Sudoku Safari for Young Minds',
                    'Wildlife Number Puzzles'
                ],
                subtitleTemplates: [
                    'Easy to Medium Sudoku Puzzles for Ages 8-12',
                    'Build Logic Skills with Animal-Themed Sudoku',
                    '100+ Fun Number Puzzles for Kids'
                ],
                descriptionTemplates: [
                    'Learn sudoku the fun way! Animal-themed number puzzles that teach logic and critical thinking.',
                    'Perfect introduction to sudoku! Starts easy and builds to medium difficulty with helpful tips.',
                    'Make math fun! Engaging sudoku puzzles that improve concentration and problem-solving.'
                ],
                structureTemplates: [
                    '100 puzzles, progressive difficulty from easy to medium, instructions included',
                    '120 sudoku grids, organized by difficulty, animal facts as bonus content',
                    '100+ challenges, teaching section, hints available, full solutions'
                ]
            }
        },
        'adults': {
            'travel': {
                titleTemplates: [
                    'Globetrotter Sudoku Collection',
                    'World Traveler\'s Sudoku Puzzles',
                    'Passport to Sudoku'
                ],
                subtitleTemplates: [
                    '200 Medium to Hard Sudoku Puzzles',
                    'Travel-Themed Number Challenges',
                    'Exercise Your Mind with Worldly Sudoku'
                ],
                descriptionTemplates: [
                    'Challenge yourself with travel-inspired sudoku! Each section features a different world region.',
                    'Perfect for flights and travel downtime! Medium to hard puzzles to keep your mind sharp.',
                    'Travel the world through numbers! Challenging sudoku with destination facts and trivia.'
                ],
                structureTemplates: [
                    '200 puzzles organized by continent, medium to hard difficulty',
                    '180 challenging grids, travel facts, complete answer key',
                    '200+ puzzles, varying difficulty, bonus travel trivia'
                ]
            }
        }
    },
    'journal': {
        'teens': {
            'nature': {
                titleTemplates: [
                    'Nature Journal for Teens',
                    'Outdoor Adventure Journal & Sketchbook',
                    'My Nature Exploration Diary'
                ],
                subtitleTemplates: [
                    'Lined Pages for Thoughts, Observations & Sketches',
                    'Document Your Adventures in the Great Outdoors',
                    '150 Pages for Nature Lovers'
                ],
                descriptionTemplates: [
                    'Capture your connection with nature! Lined pages perfect for journaling, observations, and reflections.',
                    'Document your outdoor adventures! Durable design perfect for taking on hikes and camping trips.',
                    'Express your love for nature! Quality paper for writing and sketching, with inspirational prompts.'
                ],
                structureTemplates: [
                    '150 lined pages, nature-themed prompts scattered throughout',
                    '120 pages with lines, occasional sketch spaces, nature quotes',
                    '140 pages of quality paper, monthly nature challenges, lined format'
                ]
            }
        },
        'adults': {
            'travel': {
                titleTemplates: [
                    'Travel Journal & Planner',
                    'Wanderlust: A Traveler\'s Journal',
                    'My Journey - Travel Memory Book'
                ],
                subtitleTemplates: [
                    'Document Your Adventures Around the World',
                    '200 Pages for Recording Travel Memories',
                    'Plan, Record & Remember Your Trips'
                ],
                descriptionTemplates: [
                    'Your perfect travel companion! Space for itineraries, memories, photos, and reflections from every journey.',
                    'Capture every moment! Versatile journal for planning trips and recording experiences.',
                    'Make memories last forever! Structured pages for trip details, daily logs, and personal reflections.'
                ],
                structureTemplates: [
                    '200 pages with lined sections, trip planning pages, photo spaces',
                    '180 pages including itinerary sections, daily entry pages, maps',
                    '200 pages with mixed formats: planning, daily logs, reflection prompts'
                ]
            }
        }
    },
    'dot-grid': {
        'adults': {
            'fantasy': {
                titleTemplates: [
                    'Dot Grid Notebook',
                    'Bullet Journal - Dot Grid Pages',
                    'Creative Dot Grid Planner'
                ],
                subtitleTemplates: [
                    '5mm Dot Grid for Journaling & Planning',
                    '200 Pages - Perfect for Bullet Journaling',
                    'Versatile Dot Grid for All Your Creative Needs'
                ],
                descriptionTemplates: [
                    'The ultimate versatile notebook! Dot grid pages perfect for bullet journaling, sketching, planning, and note-taking.',
                    'Your blank canvas! Quality dot grid paper that works for any system - bullet journaling, planning, or creative work.',
                    'Organize your way! Premium dot grid pages that won\'t bleed through, perfect for any pen or marker.'
                ],
                structureTemplates: [
                    '200 pages of 5mm dot grid, numbered pages, index pages included',
                    '180 dot grid pages, 5mm spacing, lay-flat binding',
                    '200 pages with 5mm dots, thick paper, includes key and index pages'
                ]
            }
        }
    }
};

// Helper function to get a random item from an array
function getRandomItem<T>(array: T[]): T | undefined {
    if (!array || array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
}


// Generate a book idea based on inputs
export function generateBookIdea(
    bookType: BookType,
    audience: Audience,
    theme: Theme
): BookIdea {
    // Get the template or use a generic fallback
    const template = TEMPLATES[bookType]?.[audience]?.[theme] || {
        titleTemplates: [`${theme.charAt(0).toUpperCase() + theme.slice(1)} ${bookType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`],
        subtitleTemplates: [`Fun and Engaging ${bookType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Book`],
        descriptionTemplates: [`An amazing collection of ${bookType.split('-').join(' ')} activities themed around ${theme}. Perfect for hours of entertainment!`],
        structureTemplates: [`50-100 pages of quality ${bookType.split('-').join(' ')} content, solutions included`]
    };

    const title = getRandomItem(template.titleTemplates) as string;
    const subtitle = getRandomItem(template.subtitleTemplates) as string;
    const description = getRandomItem(template.descriptionTemplates) as string;
    const structure = getRandomItem(template.structureTemplates) as string;


    // Determine page count based on book type and audience
    let pageCountRecommendation = '100-120 pages';
    if (audience.includes('kids-4-6')) {
        pageCountRecommendation = '40-60 pages';
    } else if (audience.includes('kids-6-8') || audience.includes('kids-8-12')) {
        pageCountRecommendation = '60-100 pages';
    } else if (bookType === 'journal' || bookType === 'dot-grid') {
        pageCountRecommendation = '120-200 pages';
    } else if (bookType === 'sudoku') {
        pageCountRecommendation = '100-200 pages (1 puzzle per page)';
    }

    // Difficulty level for puzzle books
    let difficulty: string | undefined;
    if (bookType !== 'journal' && bookType !== 'dot-grid') {
        if (audience.includes('kids-4-6')) {
            difficulty = 'Very Easy - Large print, simple solutions';
        } else if (audience.includes('kids-6-8')) {
            difficulty = 'Easy to Medium - Building skills progressively';
        } else if (audience.includes('kids-8-12')) {
            difficulty = 'Medium - Challenging but achievable';
        } else if (audience === 'adults') {
            difficulty = 'Medium to Hard - For puzzle enthusiasts';
        } else if (audience === 'seniors') {
            difficulty = 'Easy to Medium - Large print, relaxing pace';
        }
    }

    return {
        title,
        subtitle,
        description,
        structure,
        pageCountRecommendation,
        difficulty
    };


}

// Get displaynames for dropdowns
export const BOOK_TYPE_LABELS: Record<BookType, string> = {
    'word-search': '🔍 Word Search',
    'maze': '🌀 Maze',
    'sudoku': '🔢 Sudoku',
    'journal': '📔 Journal (Lined)',
    'dot-grid': '⚫ Dot Grid'
};

export const AUDIENCE_LABELS: Record<Audience, string> = {
    'kids-4-6': '👶 Kids 4-6',
    'kids-6-8': '🧒 Kids 6-8',
    'kids-8-12': '👧 Kids 8-12',
    'teens': '🎓 Teens',
    'adults': '👤 Adults',
    'seniors': '👴 Seniors'
};

export const THEME_LABELS: Record<Theme, string> = {
    'animals': '🐾 Animals',
    'space': '🚀 Space',
    'food': '🍕 Food',
    'travel': '✈️ Travel',
    'nature': '🌿 Nature',
    'fantasy': '🧙 Fantasy',
    'sports': '⚽ Sports',
    'holidays': '🎄 Holidays',
    'ocean': '🌊 Ocean',
    'dinosaurs': '🦕 Dinosaurs'
};
