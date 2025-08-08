'use client';

import React, { useState, useEffect } from 'react';
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

export default function StoredPals() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    passive_skills: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [pals, setPals] = useState<Pal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 20 cards per page
  
  // State for autocomplete options
  const [palSpecies, setPalSpecies] = useState<string[]>([]);
  const [passiveSkills, setPassiveSkills] = useState<string[]>([]);
  const [filteredPalSpecies, setFilteredPalSpecies] = useState<string[]>([]);
  const [filteredPassiveSkills, setFilteredPassiveSkills] = useState<string[]>([]);
  const [showPalDropdown, setShowPalDropdown] = useState(false);
  const [showSkillDropdowns, setShowSkillDropdowns] = useState<boolean[]>([false]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Filter pal species based on input
    if (name === 'name') {
      filterPalSpecies(value);
      setShowPalDropdown(value.length > 0);
    }
  };

  // Handle passive skill changes
  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...formData.passive_skills];
    updatedSkills[index] = value;
    setFormData(prev => ({
      ...prev,
      passive_skills: updatedSkills
    }));
    
    // Filter passive skills based on input
    filterPassiveSkills(value, index);
    
    // Update dropdown visibility for this skill field
    const updatedDropdowns = [...showSkillDropdowns];
    updatedDropdowns[index] = value.length > 0;
    setShowSkillDropdowns(updatedDropdowns);
  };
  
  // Filter pal species based on input
  const filterPalSpecies = (input: string) => {
    if (!input) {
      setFilteredPalSpecies([]);
      return;
    }
    
    const filtered = palSpecies.filter(species => 
      species.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredPalSpecies(filtered.slice(0, 5)); // Limit to 5 suggestions
  };
  
  // Filter passive skills based on input
  const filterPassiveSkills = (input: string, index: number) => {
    if (!input) {
      setFilteredPassiveSkills([]);
      return;
    }
    
    const filtered = passiveSkills.filter(skill => 
      skill.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredPassiveSkills(filtered.slice(0, 5)); // Limit to 5 suggestions
  };
  
  // Select pal species from dropdown
  const selectPalSpecies = (species: string) => {
    setFormData(prev => ({
      ...prev,
      name: species
    }));
    setShowPalDropdown(false);
  };
  
  // Select passive skill from dropdown
  const selectPassiveSkill = (skill: string, index: number) => {
    const updatedSkills = [...formData.passive_skills];
    updatedSkills[index] = skill;
    setFormData(prev => ({
      ...prev,
      passive_skills: updatedSkills
    }));
    
    // Hide dropdown after selection
    const updatedDropdowns = [...showSkillDropdowns];
    updatedDropdowns[index] = false;
    setShowSkillDropdowns(updatedDropdowns);
  };

  // Add new passive skill field
  const addSkillField = () => {
    setFormData(prev => ({
      ...prev,
      passive_skills: [...prev.passive_skills, '']
    }));
  };

  // Remove passive skill field
  const removeSkillField = (index: number) => {
    if (formData.passive_skills.length > 1) {
      const updatedSkills = formData.passive_skills.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        passive_skills: updatedSkills
      }));
    }
  };

  // Fetch pals and options on component mount
  useEffect(() => {
    fetchPals();
    fetchPalSpecies();
    fetchPassiveSkills();
  }, []);

  // Reset current page when pals data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pals.length]);

  // Fetch pals from API
  const fetchPals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pals');
      if (!response.ok) {
        throw new Error('Failed to fetch pals');
      }
      const data = await response.json();
      setPals(data);
    } catch (error) {
      console.error('Error fetching pals:', error);
      setError('Failed to load pals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch pal species options from API
  const fetchPalSpecies = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/options/pal-species`);
      if (!response.ok) {
        throw new Error(`Failed to fetch pal species options: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setPalSpecies(data.message || []);
    } catch (error) {
      console.error('Error fetching pal species options:', error);
      // Set empty array to prevent UI issues
      setPalSpecies([]);
    }
  };
  
  // Fetch passive skills options from API
  const fetchPassiveSkills = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/options/passive-skills`);
      if (!response.ok) {
        throw new Error(`Failed to fetch passive skills options: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setPassiveSkills(data.message || []);
    } catch (error) {
      console.error('Error fetching passive skills options:', error);
      // Set empty array to prevent UI issues
      setPassiveSkills([]);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      // Filter out empty passive skills
      const filteredSkills = formData.passive_skills.filter(skill => skill.trim() !== '');
      
      const payload = {
        ...formData,
        passive_skills: filteredSkills
      };

      // API endpoint would be replaced with the actual endpoint
      const response = await fetch('/api/pals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage({ text: 'Pal added successfully!', type: 'success' });
        // Reset form after successful submission
        setFormData({
          name: '',
          gender: 'Male',
          passive_skills: ['']
        });
        // Refresh the pals list
        fetchPals();
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Failed to add pal', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
      console.error('Error adding pal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header with back button */}
      <div className="flex justify-between items-center border-b border-gray-600 pb-4 bg-gray-900 p-4 rounded-t-lg -mx-4 -mt-4 mb-8">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/')} 
            className="mr-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
          <h1 className="text-2xl font-bold">Add New Pal</h1>
        </div>
        <button 
          onClick={() => router.push('/stored-pals/list')} 
          className="border border-blue-500 rounded px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        >
          View All Pals
        </button>
      </div>

      {/* Form section */}
      <div className="max-w-2xl mx-auto bg-blue-900/20 border border-blue-600 rounded-lg p-6 shadow-lg">
        {message.text && (
          <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-800/50 text-green-200' : 'bg-red-800/50 text-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Pal Name with Autocomplete */}
          <div className="mb-6 relative">
            <label htmlFor="name" className="block text-blue-200 font-medium mb-2">Pal Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={() => formData.name && setShowPalDropdown(true)}
              required
              className="w-full bg-gray-800 border border-blue-500 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter pal name"
              autoComplete="off"
            />
            
            {/* Pal Species Dropdown */}
            {showPalDropdown && filteredPalSpecies.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-blue-500 rounded shadow-lg max-h-60 overflow-auto">
                {filteredPalSpecies.map((species) => (
                  <div 
                    key={species} 
                    className="p-2 hover:bg-blue-700 cursor-pointer text-white"
                    onClick={() => selectPalSpecies(species)}
                  >
                    {species}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gender Selection */}
          <div className="mb-6">
            <label htmlFor="gender" className="block text-blue-200 font-medium mb-2">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-blue-500 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Passive Skills with Autocomplete */}
          <div className="mb-6">
            <label className="block text-blue-200 font-medium mb-2">Passive Skills</label>
            {formData.passive_skills.map((skill, index) => (
              <div key={`skill-input-${index}`} className="flex mb-2 relative">
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
                  className="flex-grow bg-gray-800 border border-blue-500 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter passive skill"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => removeSkillField(index)}
                  className="ml-2 px-4 bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
                  disabled={formData.passive_skills.length <= 1}
                >
                  -
                </button>
                
                {/* Passive Skills Dropdown */}
                {showSkillDropdowns[index] && filteredPassiveSkills.length > 0 && (
                  <div className="absolute z-10 mt-12 w-full bg-gray-800 border border-blue-500 rounded shadow-lg max-h-60 overflow-auto">
                    {filteredPassiveSkills.map((skillOption) => (
                      <div 
                        key={`${skillOption}-${index}`} 
                        className="p-2 hover:bg-blue-700 cursor-pointer text-white"
                        onClick={() => selectPassiveSkill(skillOption, index)}
                      >
                        {skillOption}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSkillField}
              className="mt-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded transition-colors"
            >
              + Add Skill
            </button>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Adding...' : 'Add Pal'}
            </button>
          </div>
        </form>
      </div>

      {/* Pals Table Section */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-xl font-semibold mb-6 text-center text-blue-200 border-b border-blue-600 pb-2">Stored Pals</h2>
        
        {loading ? (
          <div className="text-center py-6">
            <p className="text-blue-200">Loading pals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6 bg-red-800/30 border border-red-600 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        ) : pals.length === 0 ? (
          <div className="text-center py-6 bg-blue-900/20 border border-blue-600 rounded-lg">
            <p className="text-blue-200">No pals found. Add your first pal using the form above!</p>
          </div>
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {(() => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentPals = pals.slice(startIndex, endIndex);
                
                return currentPals.map((pal, index) => (
                  <div key={`${pal.name}-${pal.id}-${startIndex + index}`} className="bg-blue-900/20 border border-blue-600 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-blue-900/50 transition-all">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-blue-300 font-mono">#{pal.id}</span>
                          <h3 className="text-lg font-bold text-blue-200">{pal.name}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${
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
                            className="h-32 object-contain rounded"
                          />
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Passive Skills:</h4>
                        {pal.passive_skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {pal.passive_skills.map((skill, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-purple-800/50 border border-purple-600 text-purple-200 text-xs rounded-full"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic text-xs">No passive skills</p>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            {/* Pagination Controls */}
            {pals.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-600 text-white'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {(() => {
                    const totalPages = Math.ceil(pals.length / itemsPerPage);
                    const pages = [];
                    
                    for (let i = 1; i <= totalPages; i++) {
                      if (
                        i === 1 || 
                        i === totalPages || 
                        (i >= currentPage - 1 && i <= currentPage + 1)
                      ) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === i
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-900/50 hover:bg-blue-800 text-blue-200'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      } else if (
                        (i === currentPage - 2 && currentPage > 3) ||
                        (i === currentPage + 2 && currentPage < totalPages - 2)
                      ) {
                        pages.push(
                          <span key={i} className="text-blue-300">...</span>
                        );
                      }
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(pals.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(pals.length / itemsPerPage)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === Math.ceil(pals.length / itemsPerPage)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-600 text-white'
                  }`}
                >
                  Next
                </button>
                
                <div className="ml-4 text-sm text-blue-300">
                  Page {currentPage} of {Math.ceil(pals.length / itemsPerPage)} 
                  ({pals.length} total pals)
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}