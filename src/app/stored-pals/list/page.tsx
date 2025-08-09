'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Type definitions based on the DTO from the Go backend
type PassiveSkill = {
  name: string;
};

type Pal = {
  id: number;
  name: string;
  image_url: string;
  gender: string;
  passive_skills: PassiveSkill[];
};

export default function PalList() {
  const router = useRouter();
  const [pals, setPals] = useState<Pal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPassiveSkills, setSelectedPassiveSkills] = useState<string[]>(['']);
  const [passiveSkills, setPassiveSkills] = useState<string[]>([]);
  const [filteredPassiveSkills, setFilteredPassiveSkills] = useState<string[]>([]);
  const [showSkillDropdowns, setShowSkillDropdowns] = useState<boolean[]>([false]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [palToDelete, setPalToDelete] = useState<Pal | null>(null);

  useEffect(() => {
    const fetchPals = async () => {
      try {
        const response = await fetch('/api/pals');
        if (!response.ok) {
          throw new Error('Failed to fetch pals');
        }
        const data = await response.json();
        setPals(data || []);
      } catch (error) {
        console.error('Error fetching pals:', error);
        setError('Failed to load pals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchPassiveSkills = async () => {
      try {
        const response = await fetch('/api/options/passive-skills');
        if (!response.ok) {
          throw new Error('Failed to fetch passive skills');
        }
        const data = await response.json();
        const skills = data || [];
        const uniqueSkills = [...new Set(skills.map((skill: any) => skill.name))] as string[];
        setPassiveSkills(uniqueSkills);
      } catch (error) {
        console.error('Error fetching passive skills:', error);
      }
    };

    fetchPals();
    fetchPassiveSkills();
  }, []);

  // Handle passive skill changes
  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...selectedPassiveSkills];
    updatedSkills[index] = value;
    setSelectedPassiveSkills(updatedSkills);
    
    // Filter passive skills based on input
    filterPassiveSkills(value, index);
    
    // Update dropdown visibility for this skill field
    const updatedDropdowns = [...showSkillDropdowns];
    updatedDropdowns[index] = value.length > 0;
    setShowSkillDropdowns(updatedDropdowns);
  };

  // Filter passive skills based on input
  const filterPassiveSkills = (input: string, index: number) => {
    if (!input) {
      setFilteredPassiveSkills([]);
      return;
    }
    const filtered = passiveSkills.filter(skill => 
      skill && skill.toLowerCase().includes(input.toLowerCase()) &&
      !selectedPassiveSkills.includes(skill)
    );
    setFilteredPassiveSkills(filtered.slice(0, 5)); // Limit to 5 suggestions
  };

  // Select passive skill from dropdown
  const selectPassiveSkill = (skill: string, index: number) => {
    const updatedSkills = [...selectedPassiveSkills];
    updatedSkills[index] = skill;
    setSelectedPassiveSkills(updatedSkills);
    
    // Hide dropdown after selection
    const updatedDropdowns = [...showSkillDropdowns];
    updatedDropdowns[index] = false;
    setShowSkillDropdowns(updatedDropdowns);
  };

  // Add new passive skill field
  const addSkillField = () => {
    if (selectedPassiveSkills.length < 4) {
      setSelectedPassiveSkills([...selectedPassiveSkills, '']);
      setShowSkillDropdowns([...showSkillDropdowns, false]);
    }
  };

  // Remove passive skill field
  const removeSkillField = (index: number) => {
    if (selectedPassiveSkills.length > 1) {
      const updatedSkills = selectedPassiveSkills.filter((_, i) => i !== index);
      const updatedDropdowns = showSkillDropdowns.filter((_, i) => i !== index);
      setSelectedPassiveSkills(updatedSkills);
      setShowSkillDropdowns(updatedDropdowns);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPassiveSkills(['']);
    setShowSkillDropdowns([false]);
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (pal: Pal) => {
    setPalToDelete(pal);
    setShowDeleteModal(true);
  };

  // Delete pal function
  const deletePal = async () => {
    if (!palToDelete) return;

    try {
      const response = await fetch('/api/remove-pal', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: palToDelete.name,
          id: palToDelete.id
        })
      });

      if (response.ok) {
        // Remove the pal from the local state
        setPals(pals.filter(p => p.id !== palToDelete.id));
        setShowDeleteModal(false);
        setPalToDelete(null);
      } else {
        alert('Failed to delete pal. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting pal:', error);
      alert('Error deleting pal. Please try again.');
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPalToDelete(null);
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header with back button */}
      <div className="flex justify-between items-center border-b border-gray-600 pb-4 bg-gray-900 p-4 rounded-t-lg -mx-4 -mt-4 mb-8">
        <div className="flex items-center">
          <button 
              onClick={() => router.push('/stored-pals')} 
              className="mr-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
           <h1 className="text-2xl font-bold">Stored Pals</h1>
         </div>
         <button 
              onClick={() => router.push('/stored-pals')} 
              className="border border-blue-500 rounded px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white transition-colors"
            >
              Add New Pal
            </button>
      </div>

        {/* Search and Filter Controls */}
        <div className="max-w-2xl mx-auto bg-blue-900/20 border border-blue-600 rounded-lg p-6 shadow-lg mb-6 space-y-4">
          {/* Search Bar */}
          <div className="w-full">
            <label htmlFor="search" className="block text-blue-200 font-medium mb-2">Search Pals</label>
            <input
              id="search"
              type="text"
              placeholder="Search pals by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Passive Skills Filter */}
           <div className="w-1/2">
            <label className="block text-blue-200 font-medium mb-2">Filter by Passive Skills (Max 4)</label>
              {selectedPassiveSkills.map((skill, index) => (
                <div key={`skill-filter-${index}`} className="flex mb-2 relative">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    onFocus={() => {
                      const updatedDropdowns = [...showSkillDropdowns];
                      if (skill) {
                        updatedDropdowns[index] = true;
                        setShowSkillDropdowns(updatedDropdowns);
                        filterPassiveSkills(skill, index);
                      }
                    }}
                  className="flex-grow px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter passive skill to filter"
                    autoComplete="off"
                  />
                  {selectedPassiveSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkillField(index)}
                      className="ml-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      -
                    </button>
                  )}
                  
                  {/* Passive Skills Dropdown */}
                  {showSkillDropdowns[index] && filteredPassiveSkills.length > 0 && (
                    <div className="absolute z-10 mt-12 w-full bg-gray-800 border border-blue-500 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredPassiveSkills.map((skillOption) => (
                        <div 
                          key={`${skillOption}-filter-${index}`} 
                          className="p-3 hover:bg-blue-700 cursor-pointer text-white border-b border-gray-700 last:border-b-0"
                          onClick={() => selectPassiveSkill(skillOption, index)}
                        >
                          {skillOption}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {selectedPassiveSkills.length < 4 && (
                <button
                  type="button"
                  onClick={addSkillField}
                  className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                >
                  + Add Skill Filter
                </button>
              )}
             </div>
             
             {/* Clear Filters Button */}
             {(searchTerm || selectedPassiveSkills.some(skill => skill)) && (
               <div className="mt-4">
                 <button
                   onClick={clearFilters}
                   className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                 >
                   Clear All Filters
                 </button>
               </div>
             )}
         </div>

        <div className="w-full bg-blue-900/20 border border-blue-600 rounded-lg p-6 shadow-lg space-y-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="mt-4 text-gray-300">Loading your stored pals...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-red-900/20 border border-red-600 rounded-lg">
              <p className="text-xl text-red-200">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : pals.length === 0 ? (
            <div className="text-center py-10 bg-gray-800/50 border border-gray-600 rounded-lg">
              <p className="text-xl text-gray-300">No pals stored yet.</p>
              <p className="text-gray-400 mt-2">Add your first pal to get started!</p>
              <button
                onClick={() => router.push('/stored-pals/add')}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add New Pal
              </button>
            </div>
          ) : (
            <>
              {(() => {
                const filteredPals = pals.filter((pal) => {
                  const matchesSearch = pal.name.toLowerCase().includes(searchTerm.toLowerCase());
                  const activeSkillFilters = selectedPassiveSkills.filter(skill => skill.trim());
                  const matchesPassiveSkills = activeSkillFilters.length === 0 || 
                    activeSkillFilters.every(filterSkill => 
                      pal.passive_skills.some(palSkill => 
                        palSkill.name.toLowerCase().includes(filterSkill.toLowerCase())
                      )
                    );
                  return matchesSearch && matchesPassiveSkills;
                });

                return (
                  <>
                    {/* Results Counter */}
                    <div className="mb-4 text-gray-300">
                      <p>
                        Showing {filteredPals.length} of {pals.length} pal{pals.length !== 1 ? 's' : ''}
                        {(searchTerm || selectedPassiveSkills.some(skill => skill)) && (
                          <span className="text-blue-300">
                            {searchTerm && ` matching "${searchTerm}"`}
                            {searchTerm && selectedPassiveSkills.some(skill => skill) && ' and'}
                            {selectedPassiveSkills.some(skill => skill) && ` with skills: ${selectedPassiveSkills.filter(skill => skill).join(', ')}`}
                          </span>
                        )}
                      </p>
                    </div>

                    {filteredPals.length === 0 ? (
                      <div className="text-center py-10 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                        <p className="text-xl text-yellow-200">
                          No pals found matching your search criteria.
                        </p>
                        <p className="text-gray-400 mt-2">
                          Try adjusting your search term or filter settings.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {filteredPals.map((pal) => (
                          <div key={`${pal.name}-${pal.id}`} className="bg-blue-900/20 border border-blue-600 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-blue-900/50 transition-all relative">
                            <div className="p-4">
                              {/* Delete button */}
                              <button
                                 onClick={() => showDeleteConfirmation(pal)}
                                 className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors z-10"
                                 title={`Delete ${pal.name}`}
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
                               </button>
                              
                              <div className="flex items-center justify-between mb-4 pr-8">
                                <h3 className="text-xl font-bold text-blue-200">{pal.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  pal.gender === 'm' || pal.gender === 'male' || pal.gender === 'Male' 
                                    ? 'bg-blue-800 text-blue-200' 
                                    : 'bg-pink-800 text-pink-200'
                                }`}>
                                  {pal.gender === 'm' ? 'male' : pal.gender === 'f' ? 'female' : pal.gender.toLowerCase()}
                                </span>
                              </div>
                              
                              {pal.image_url && (
                                <div className="mb-4 flex justify-center">
                                  <img 
                                    src={pal.image_url} 
                                    alt={pal.name} 
                                    className="h-40 object-contain rounded"
                                  />
                                </div>
                              )}
                              
                              <div className="mt-4">
                                <h4 className="text-md font-semibold text-blue-300 mb-2">Passive Skills:</h4>
                                {pal.passive_skills.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {pal.passive_skills.map((skill, skillIndex) => (
                                      <span 
                                        key={`${pal.id}-skill-${skillIndex}-${skill.name}`} 
                                        className="px-3 py-1 bg-purple-800/50 border border-purple-600 text-purple-200 text-sm rounded-full"
                                      >
                                        {skill.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-400 italic">No passive skills</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && palToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Delete Pal</h3>
                  <p className="text-gray-300">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-200 mb-6">
                Are you sure you want to delete <span className="font-semibold text-blue-300">{palToDelete.name}</span>?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deletePal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}