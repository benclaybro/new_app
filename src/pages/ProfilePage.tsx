import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
import { Calendar, Check, AlertCircle, Save, X, Pencil } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../config/supabase';
import NylasAuth from '../components/auth/NylasAuth';
import { getUsersById } from '../utils/users';


export const ProfilePage = () => {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  useEffect(() => {
    const getUser = async () => {
    console.log("profile",profile)
    const user = await getUsersById(profile?.id);
    console.log()
    if(user[0]?.nylas_grant_email){
      setSuccess(true)
    }
  }
  getUser(); 
  }, [])
  const handleSaveProfile = async () => {
    if (!profile?.id) return;

    try {
      setSavingProfile(true);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: editedProfile.name,
          email: editedProfile.email,
          phone: editedProfile.phone
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state
      useAuthStore.setState(state => ({
        ...state,
        profile: {
          ...state.profile!,
          name: editedProfile.name,
          email: editedProfile.email,
          phone: editedProfile.phone
        }
      }));

      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlConnectWithCalendar = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Flip the values after a timeout
    setTimeout(() => {
      setLoading(false);
      
    }, 5000); // Adjust the delay time (in milliseconds) as needed
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Pencil className="h-6 w-6 text-[#CF7128]" />
                </button>
              )}
            </div>

            <div className="space-y-8">
              {/* Profile Information */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <Save className="h-5 w-5 text-[#CF7128]" />
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                      />
                    ) : (
                      <p className="mt-1 text-lg">{profile?.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {editing ? (
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                      />
                    ) : (
                      <p className="mt-1 text-lg">{profile?.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {editing ? (
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                      />
                    ) : (
                      <p className="mt-1 text-lg">{profile?.phone || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-lg">{profile?.role}</p>
                  </div>
                </div>
              </div>

              {/* Calendar Integration */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Calendar Integration</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-[#CF7128] flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Google Calendar</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Connect your Google Calendar to manage your availability and appointments.
                      </p>

                      {error && (
                        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="h-5 w-5 flex-shrink-0" />
                          <p className="text-sm">{error}</p>
                        </div>
                      )}

                      {success && (
                        <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                          <Check className="h-5 w-5 flex-shrink-0" />
                          <p className="text-sm">Successfully connected to Google Calendar!</p>
                        </div>
                      )}

                      <button
                        onClick={handlConnectWithCalendar}
                        disabled={loading}
                        className="mt-4 inline-flex items-center gap-2 bg-[#CF7128] text-white px-4 py-2 rounded-lg hover:bg-[#B86422] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <NylasAuth />
                            {/* <Calendar className="h-4 w-4" />
                            <span>Connect Google Calendar</span> */}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};