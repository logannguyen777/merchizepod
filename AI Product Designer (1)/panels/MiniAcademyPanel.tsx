/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AcademyLesson } from '../types';
import { 
    AcademicCapIcon, 
    MagnifyingGlassIcon, 
    PaintBrushIcon, 
    MegaphoneIcon, 
    ChevronDownIcon 
} from '../components/icons';

const lessons: AcademyLesson[] = [
    {
        id: 'foundations',
        title: 'POD Foundations',
        icon: AcademicCapIcon,
        summary: 'Understand the core concepts of Print-on-Demand.',
        content: `
            <p><strong>Print-on-Demand (POD)</strong> is a business model where you sell products with your custom designs without ever holding inventory yourself. It's a fantastic way to start an e-commerce business with very low risk.</p>
            <p>Here’s the simple workflow:</p>
            <ul>
                <li><strong>1. You Create a Design:</strong> Use our AI tools or upload your own artwork.</li>
                <li><strong>2. List on a Store:</strong> You create a product mockup (like a t-shirt) and list it for sale.</li>
                <li><strong>3. Customer Buys:</strong> A customer finds your product and makes a purchase.</li>
                <li><strong>4. We Handle the Rest:</strong> The order automatically goes to our suppliers who print, pack, and ship the product directly to your customer.</li>
                <li><strong>5. You Get Paid:</strong> You keep the profit (the sale price minus the product cost).</li>
            </ul>
        `
    },
    {
        id: 'niche',
        title: 'Niche Research & Validation',
        icon: MagnifyingGlassIcon,
        summary: 'Learn how to find profitable niches that sell.',
        content: `
            <p>Trying to sell to everyone often means you sell to no one. The key to success is finding a <strong>niche</strong> – a specific group of people with a shared passion.</p>
            <p><strong>How to find a niche:</strong></p>
            <ul>
                <li><strong>Passions & Hobbies:</strong> Think of groups like avid book readers, cat lovers, hikers, or vintage car enthusiasts.</li>
                <li><strong>Professions:</strong> Nurses, teachers, engineers, and software developers all have unique cultures and inside jokes.</li>
                <li><strong>Life Events:</strong> Weddings, new parents, graduations, and holidays are always popular.</li>
            </ul>
            <p>Use the <strong>Dashboard</strong> in this app to validate your ideas! Look for keywords with "High" volume and "Low" or "Medium" competition. That's the sweet spot!</p>
        `
    },
    {
        id: 'design',
        title: 'Design & Copyright 101',
        icon: PaintBrushIcon,
        summary: 'Create designs that sell and stay out of legal trouble.',
        content: `
            <p>A great design is the heart of a great product. But it's crucial to understand the rules.</p>
            <p><strong>What makes a good design?</strong></p>
            <ul>
                <li><strong>Uniqueness:</strong> Your design should stand out from the crowd.</li>
                <li><strong>Relevance:</strong> It should resonate deeply with your chosen niche.</li>
                <li><strong>Quality:</strong> Always use high-resolution files (300 DPI is the standard). Our AI Artwork Generator creates high-quality, print-ready files for you!</li>
            </ul>
            <p><strong>⚠️ The GOLDEN RULE of Copyright & Trademark:</strong></p>
            <p>You <strong>CANNOT</strong> use characters, logos, song lyrics, or names from popular culture (like Disney, Nike, Star Wars, Taylor Swift, etc.). This is illegal, will get your store shut down, and can lead to legal action. Always create 100% original art or use graphics you have a valid license to use for commercial purposes.</p>
        `
    },
    {
        id: 'marketing',
        title: 'Marketing & SEO',
        icon: MegaphoneIcon,
        summary: 'Get your products seen by the right customers.',
        content: `
            <p>Creating a great product is only half the battle. Now you need to make sure customers can find it!</p>
            <p><strong>SEO (Search Engine Optimization) is Key:</strong></p>
            <p>When you fill out your product details, you're performing SEO. The most important parts are:</p>
            <ul>
                <li><strong>Title:</strong> Be descriptive and use keywords. "Funny Cat Dad T-Shirt for Father's Day" is much better than "Cool Shirt".</li>
                <li><strong>Description:</strong> Tell a story about the product and use more keywords naturally.</li>
                <li><strong>Tags:</strong> Think like a customer. What words would they type into the search bar? Use all 13 tags on Etsy! Our AI Listing Generator is perfect for this.</li>
            </ul>
            <p><strong>Simple Marketing:</strong> Share your mockups on social media! Pinterest, Instagram, and Facebook groups related to your niche are great places to start getting eyeballs on your designs.</p>
        `
    }
];

export const MiniAcademyPanel: React.FC = () => {
    const [expandedLessonId, setExpandedLessonId] = useState<string | null>('foundations');

    const toggleLesson = (id: string) => {
        setExpandedLessonId(currentId => (currentId === id ? null : id));
    };

    return (
        <div className="dashboard-panel">
            <header className="welcome-header">
                <h1>POD Mini Academy</h1>
                <p>Your crash course on building a successful Print-on-Demand business. Start here!</p>
            </header>

            <section className="academy-panel">
                {lessons.map(lesson => {
                    const isExpanded = expandedLessonId === lesson.id;
                    return (
                        <div key={lesson.id} className="lesson-card">
                            <button
                                className="lesson-header"
                                onClick={() => toggleLesson(lesson.id)}
                                aria-expanded={isExpanded}
                                aria-controls={`lesson-content-${lesson.id}`}
                            >
                                <div className="lesson-icon"><lesson.icon /></div>
                                <div className="lesson-title-summary">
                                    <h3>{lesson.title}</h3>
                                    <p>{lesson.summary}</p>
                                </div>
                                <div className="lesson-chevron">
                                    <ChevronDownIcon />
                                </div>
                            </button>
                            <div
                                id={`lesson-content-${lesson.id}`}
                                className="lesson-content"
                                style={{ maxHeight: isExpanded ? '500px' : '0px', padding: isExpanded ? '0 1.25rem 1.25rem' : '0 1.25rem' }}
                                dangerouslySetInnerHTML={{ __html: lesson.content }}
                            />
                        </div>
                    );
                })}
            </section>
        </div>
    );
};
