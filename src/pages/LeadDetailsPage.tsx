import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Pencil, Save, X, Calculator, Calendar } from 'lucide-react';
import { getLead, updateLead, deleteLead } from '../utils/leads';
import { useAuthStore } from '../store/authStore';
import { useDesignStore } from '../store/designStore';
import type { Database } from '../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

export const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [error, setError] = useState<string | null>(null);
  const { setAddress, setMonthlyBill, setUtilityProvider, setPanelCount, setSystemSize } = useDesignStore();

  const handleCalculatorClick = () => {
    if (!lead?.contact_info || typeof lead.contact_info !== 'object') {
      setError('Missing lead contact information');
      navigate('/design');
      return;
    }

    const contactInfo = lead.contact_info as any;
    
    // Validate required data
    if (!contactInfo.monthly_bill || !contactInfo.utility || !contactInfo.system_size || !contactInfo.panel_count) {
      setError('Missing required calculator data');
      navigate('/design');
      return;
    }
    
    // Initialize design store with lead data
    setAddress(lead.address);
    setMonthlyBill(contactInfo.monthly_bill || 0);
    setUtilityProvider(contactInfo.utility || '');
    setPanelCount(contactInfo.panel_count || 0);
    setSystemSize(contactInfo.system_size || 0);

    // Navigate to results with lead data
    navigate('/results', { state: { leadId: id, from: `/leads/${id}` } });
  };

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        setError(null);
        const data = await getLead(id);
        if (data) {
          setLead(data);
          setEditedLead(data);
        } else {
          setError('Lead not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
        setError('Failed to load lead details');
        setTimeout(() => navigate('/dashboard'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleSave = async () => {
    if (!id || !editedLead) return;
    try {
      const updated = await updateLead(id, editedLead);
      setLead(updated);
      setEditing(false);
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CF7128]"></div>
      </div>
    );
  }

  if (!lead || error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Lead not found'}
        </div>
      </div>
    );
  }
  
  const handleScheduleClick = () => {
    navigate('/schedule', { 
      state: { 
        from: `/leads/${id}`,
        leadId: id 
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6 text-[#CF7128]" />
          </button>
          
          <div className="flex items-center gap-2">
            {editing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6 text-[#CF7128]" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Save className="h-6 w-6 text-[#CF7128]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Pencil className="h-6 w-6 text-[#CF7128]" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Trash2 className="h-6 w-6 text-[#CF7128]" />
                </button>
                <button
                  onClick={handleCalculatorClick}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Calculator className="h-6 w-6 text-[#CF7128]" />
                </button>
                <button 
                  onClick={handleScheduleClick}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Calendar className="h-6 w-6 text-[#CF7128]" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lead Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={(editedLead.contact_info as any)?.firstName || ''}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        contact_info: {
                          ...(editedLead.contact_info as any || {}),
                          firstName: e.target.value
                        }
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-lg">{(lead.contact_info as any)?.firstName || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={(editedLead.contact_info as any)?.lastName || ''}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        contact_info: {
                          ...(editedLead.contact_info as any || {}),
                          lastName: e.target.value
                        }
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-lg">{(lead.contact_info as any)?.lastName || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={(editedLead.contact_info as any)?.phone || ''}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        contact_info: {
                          ...(editedLead.contact_info as any || {}),
                          phone: e.target.value
                        }
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-lg">{(lead.contact_info as any)?.phone || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  {editing ? (
                    <input
                      type="email"
                      value={(editedLead.contact_info as any)?.email || ''}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        contact_info: {
                          ...(editedLead.contact_info as any || {}),
                          email: e.target.value
                        }
                      })}
                    />
                  ) : (
                    <p className="mt-1 text-lg">{(lead.contact_info as any)?.email || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedLead.address}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                      onChange={(e) => setEditedLead({ ...editedLead, address: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 text-lg">{lead.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  {editing ? (
                    <select
                      value={editedLead.status}
                      onChange={(e) => setEditedLead({ ...editedLead, status: e.target.value as Lead['status'] })}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                    >
                      <option value="new">New</option>
                      <option value="go back">Go Back</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="no show">No Show</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="disqualified">Disqualified</option>
                      <option value="pitched">Pitched</option>
                      <option value="failed credit">Failed Credit</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-lg capitalize">{lead.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  {editing ? (
                    <textarea
                      value={editedLead.notes || ''}
                      onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CF7128] focus:ring-[#CF7128] text-base"
                    />
                  ) : (
                    <p className="mt-1 text-lg whitespace-pre-wrap">{lead.notes}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Solar Design</h2>
              {lead.contact_info && typeof lead.contact_info === 'object' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Bill</label>
                    <p className="mt-1 text-lg">
                      ${lead.contact_info && typeof lead.contact_info === 'object' ? 
                        (lead.contact_info as any).monthly_bill || 'N/A' : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">System Size</label>
                    <p className="mt-1 text-lg">
                      {lead.contact_info && typeof lead.contact_info === 'object' && 
                       (lead.contact_info as any).system_size ? 
                        `${(lead.contact_info as any).system_size.toFixed(1)} kW` : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Panel Count</label>
                    <p className="mt-1 text-lg">
                      {lead.contact_info && typeof lead.contact_info === 'object' && 
                       (lead.contact_info as any).panel_count ? 
                        `${(lead.contact_info as any).panel_count} panels` : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Utility Provider</label>
                    <p className="mt-1 text-lg">
                      {lead.contact_info && typeof lead.contact_info === 'object' ? 
                        (lead.contact_info as any).utility || 'N/A' : 
                        'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};