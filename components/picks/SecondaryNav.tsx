import { Search, Bell } from 'lucide-react';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';
import { ProfileIcon } from '@/components/picks/ProfileIcon';

export function SecondaryNav({ onLoginClick }: { onLoginClick: () => void }) {
    const { user } = usePicksAuth();

    return (
        <div className="flex items-center justify-between mb-8 w-full">
            {/* Left side: Navigation links and Search inside a pill */}
            <div className="flex items-center border border-white/20 rounded-full bg-black/20 p-1 pl-4 flex-1 max-w-3xl">
                <div className="flex items-center gap-6 font-semibold mr-6">
                    <button className="text-white relative">
                        Picks
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"></div>
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">Discover</button>
                    <button className="text-gray-400 hover:text-white transition-colors">Community</button>
                </div>
                
                {/* Search bar */}
                <div className="flex-1 relative flex items-center border-l border-white/10 pl-4 py-1.5 mr-2">
                    <Search size={18} className="text-gray-400 absolute left-6" />
                    <input 
                        type="text"
                        placeholder="Search Topic"
                        className="w-full bg-transparent text-white placeholder-gray-400 outline-none pl-10 pr-4 text-sm"
                    />
                </div>
            </div>

            {/* Right side: Notifications and Login */}
            <div className="flex items-center gap-4 ml-4">
                <button className="p-2 text-gray-300 hover:text-white transition-colors">
                    <Bell size={22} />
                </button>
                
                {user ? (
                    <ProfileIcon />
                ) : (
                    <button 
                        onClick={onLoginClick}
                        className="bg-[#1f9349] hover:bg-[#1a7f3f] text-white px-8 py-2 rounded-full font-bold transition-colors"
                    >
                        Login
                    </button>
                )}
            </div>
        </div>
    );
}
