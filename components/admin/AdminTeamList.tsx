"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus,
    Trash,
    Edit3,
    Check,
    X
} from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function AdminTeamList() {
    const [teamData, setTeamData] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        role: '',
        is_core_team: false,

        image_url: '',
        bio: '',
        display_order: 0
    });

    const handleAddMember = async () => {
        const { error } = await supabase
            .from('team_members')
            .insert([addForm]);

        if (error) {
            alert('Error adding member: ' + error.message);
        } else {
            loadData();
            setIsAdding(false);
            setAddForm({
                name: '',
                role: '',
                is_core_team: false,
                image_url: '',
                bio: '',
                display_order: 0
            });
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error(error);
        } else {
            setTeamData(data || []);
        }
        setIsLoading(false);
    };

    useState(() => {
        loadData();
    });

    const handleEdit = (id: string, member: any) => {
        setIsEditing(id);
        setEditForm({ ...member });
    };

    const handleSave = async (id: string) => {
        const { error } = await supabase
            .from('team_members')
            .update(editForm)
            .eq('id', id);

        if (error) {
            alert('Error updating member: ' + error.message);
        } else {
            loadData();
            setIsEditing(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this member?')) return;
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting member: ' + error.message);
        } else {
            loadData();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Team Management</h3>
            {isLoading ? (
                <div className="flex justify-center p-8">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Core?</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-950 divide-y divide-gray-800">
                            {teamData.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex-shrink-0 h-10 w-10 relative group">
                                            {member.image_url ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={member.image_url} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isEditing === member.id ? (
                                            <input
                                                type="text"
                                                className="bg-gray-800 text-white rounded px-2 py-1 w-full border border-gray-700 focus:border-primary outline-none"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm((prev: any) => ({ ...prev, name: e.target.value }))}
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-white">{member.name}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isEditing === member.id ? (
                                            <input
                                                type="text"
                                                className="bg-gray-800 text-white rounded px-2 py-1 w-full border border-gray-700 focus:border-primary outline-none"
                                                value={editForm.role}
                                                onChange={(e) => setEditForm((prev: any) => ({ ...prev, role: e.target.value }))}
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-400">{member.role}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal">
                                        {isEditing === member.id ? (
                                            <input
                                                type="text"
                                                className="bg-gray-800 text-white rounded px-2 py-1 w-full border border-gray-700 focus:border-primary outline-none"
                                                value={editForm.bio || ''}
                                                onChange={(e) => setEditForm((prev: any) => ({ ...prev, bio: e.target.value }))}
                                                placeholder="Hover text"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-500 truncate max-w-[150px]">{member.bio || '-'}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isEditing === member.id ? (
                                            <select
                                                className="bg-gray-800 text-white rounded px-2 py-1 border border-gray-700"
                                                value={editForm.is_core_team ? 'true' : 'false'}
                                                onChange={(e) => setEditForm((prev: any) => ({ ...prev, is_core_team: e.target.value === 'true' }))}
                                            >
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.is_core_team ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {member.is_core_team ? 'Yes' : 'No'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {isEditing === member.id ? (
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleSave(member.id)} className="text-green-400 hover:text-green-300">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => setIsEditing(null)} className="text-gray-400 hover:text-gray-300">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex space-x-3">
                                                <button onClick={() => handleEdit(member.id, member)} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(member.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Add Member Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-white">Add New Team Member</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Image</label>
                                <ImageUploader
                                    bucket="team-images"
                                    onUploadComplete={(url) => setAddForm(prev => ({ ...prev, image_url: url }))}
                                />
                                {addForm.image_url && (
                                    <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                                        <Check size={14} /> Image uploaded successfully
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-primary outline-none"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-primary outline-none"
                                    value={addForm.role}
                                    onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value }))}
                                    placeholder="e.g. Core Organizer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Bio (Hover Text)</label>
                                <textarea
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-primary outline-none h-20 resize-none"
                                    value={addForm.bio}
                                    onChange={(e) => setAddForm(prev => ({ ...prev, bio: e.target.value }))}
                                    placeholder="Optional custom text shown on hover"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-400">Core Team Member?</label>
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-primary focus:ring-primary"
                                    checked={addForm.is_core_team}
                                    onChange={(e) => setAddForm(prev => ({ ...prev, is_core_team: e.target.checked }))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMember}
                                className="px-4 py-2 bg-primary text-black font-bold rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!addForm.name || !addForm.role}
                            >
                                Add Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                className="mt-4 px-4 py-2 bg-primary text-black font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                onClick={() => {
                    setAddForm({
                        name: '',
                        role: '',
                        is_core_team: false,

                        image_url: '',
                        bio: '',
                        display_order: teamData.length + 1
                    });
                    setIsAdding(true);
                }}
            >
                <Plus size={18} /> Add New Member
            </button>
        </div>
    );
}

