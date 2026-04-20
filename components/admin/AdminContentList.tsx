"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit3, Check, X } from 'lucide-react';

const DEFAULT_SECTIONS = [
    { key: 'hero', name: 'Home Hero Section', fields: { tagline: 'Code. Collaborate. Create.', description: 'Building the future of open source engineering through innovation and community.' } },
    { key: 'what_we_do', name: 'What We Do - Intro', fields: { subtitle: 'Empowering students to transition from participants to open-source contributors through hands-on collaboration.' } },
    { key: 'what_we_do_cards', name: 'What We Do - Detailed Cards', fields: { 
        card1_title: 'Workshops & Events',
        card1_desc: 'Curated hands-on workshops, 24-hour hackathons, and deep-dive technical talks featuring industry professionals and open-source foundation maintainers.',
        card2_title: 'Skill Development',
        card2_desc: 'Structured, mentor-led learning paths covering Git architecture, Linux administration, full-stack web engineering, and navigating your first pull requests in major open-source repositories.',
        card3_title: 'Community Building',
        card3_desc: 'Fusing a supportive environment where seasoned developers and beginners collaborate daily. We build side-projects, share knowledge peer-to-peer, and grow as a collective unit.'
    }},
    { key: 'about', name: 'About Page - Mission & Vision', fields: { mission: 'To create a culture of coding, collaboration, and contribution to open-source software within the campus.', vision: 'Becoming the leading technical community that bridges the gap between academics and the open-source software industry.' } },
    { key: 'about_extras', name: 'About Page - Other Text', fields: { intro_tagline: 'Building a culture of open collaboration, innovation, and knowledge sharing at CEV', connect_desc: 'Join our community on social media and stay updated with the latest events, workshops, and opportunities.' } }
];

export default function AdminContentList() {
    const [contents, setContents] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const loadData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('site_content').select('*');
        if (error) {
            console.error(error);
        } else {
            const contentMap: Record<string, any> = {};
            data?.forEach(item => {
                contentMap[item.section] = item.content;
            });
            setContents(contentMap);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleEdit = (sectionKey: string, defaultFields: any) => {
        setEditingSection(sectionKey);
        setEditForm({ ...defaultFields, ...(contents[sectionKey] || {}) });
    };

    const handleSave = async (sectionKey: string) => {
        // Check if exists
        const { data: existing } = await supabase.from('site_content').select('id').eq('section', sectionKey).single();
        
        if (existing) {
            await supabase.from('site_content').update({ content: editForm }).eq('section', sectionKey);
        } else {
            await supabase.from('site_content').insert({ section: sectionKey, content: editForm });
        }
        
        setEditingSection(null);
        loadData();
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                Site Content Management
            </h3>

            {isLoading ? (
                <div className="flex justify-center p-8 text-primary">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {DEFAULT_SECTIONS.map((section) => {
                        const isEditing = editingSection === section.key;
                        const currentData = { ...section.fields, ...(contents[section.key] || {}) };

                        return (
                            <div key={section.key} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                                    <h4 className="text-lg font-bold text-white">{section.name}</h4>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-white px-2 py-1 flex items-center gap-1 text-sm bg-gray-800 rounded">
                                                <X size={14} /> Cancel
                                            </button>
                                            <button onClick={() => handleSave(section.key)} className="text-black bg-primary hover:bg-primary/90 px-3 py-1 flex items-center gap-1 text-sm rounded font-medium">
                                                <Check size={14} /> Save
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEdit(section.key, section.fields)} className="text-gray-300 hover:text-white px-3 py-1 flex items-center gap-1 text-sm bg-gray-800 rounded">
                                            <Edit3 size={14} /> Edit
                                        </button>
                                    )}
                                </div>
                                
                                <div className="p-5 space-y-4">
                                    {Object.keys(section.fields).map(fieldKey => (
                                        <div key={fieldKey}>
                                            <label className="block text-sm font-medium text-gray-400 mb-1 capitalize">{fieldKey}</label>
                                            {isEditing ? (
                                                <textarea
                                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-primary outline-none min-h-[60px]"
                                                    value={editForm[fieldKey] || ''}
                                                    onChange={e => setEditForm({ ...editForm, [fieldKey]: e.target.value })}
                                                />
                                            ) : (
                                                <div className="bg-gray-800/50 p-3 rounded border border-gray-800 text-gray-300 text-sm whitespace-pre-wrap">
                                                    {currentData[fieldKey]}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
