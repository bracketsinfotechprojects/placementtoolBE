import React, { useState } from 'react';

function PlacementExecutiveCreateForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    joining_date: '',
    employment_type: [],
    facility_types_handled: [],
    login_userID: '',
    login_password: '',
    photograph: null,
  });

  // Employment type options
  const employmentTypeOptions = ['Full-time', 'Part-time', 'Casual', 'Contract', 'Temporary', 'Permanent'];

  // Facility type options
  const facilityTypeOptions = ['Aged Care', 'Disability', 'Home Care', 'Child Care', 'Mental Health', 'Community Services'];

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'employment_type' || name === 'facility_types_handled') {
        handleCheckboxChange(name, value, checked);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle checkbox changes for arrays
  const handleCheckboxChange = (name, value, checked) => {
    setFormData(prev => {
      const currentArray = prev[name] || [];
      if (checked) {
        return { ...prev, [name]: [...currentArray, value] };
      } else {
        return { ...prev, [name]: currentArray.filter(item => item !== value) };
      }
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, photograph: file }));
  };

  // Handle employment type checkbox
  const handleEmploymentTypeChange = (type) => {
    setFormData(prev => {
      const current = prev.employment_type || [];
      if (current.includes(type)) {
        return { ...prev, employment_type: current.filter(t => t !== type) };
      } else {
        return { ...prev, employment_type: [...current, type] };
      }
    });
  };

  // Handle facility type checkbox
  const handleFacilityTypeChange = (type) => {
    setFormData(prev => {
      const current = prev.facility_types_handled || [];
      if (current.includes(type)) {
        return { ...prev, facility_types_handled: current.filter(t => t !== type) };
      } else {
        return { ...prev, facility_types_handled: [...current, type] };
      }
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData
      const data = new FormData();

      // Required fields
      data.append('full_name', formData.full_name);
      data.append('mobile_number', formData.mobile_number);
      data.append('joining_date', formData.joining_date);
      data.append('login[userID]', formData.login_userID);
      data.append('login[password]', formData.login_password);

      // Optional fields
      if (formData.email) {
        data.append('email', formData.email);
      }

      // Array fields
      formData.employment_type.forEach(type => {
        data.append('employment_type[]', type);
      });
      formData.facility_types_handled.forEach(type => {
        data.append('facility_types_handled[]', type);
      });

      // File
      if (formData.photograph) {
        data.append('photograph', formData.photograph);
      }

      // Get auth token
      const token = localStorage.getItem('authToken') || '';

      // Send request
      const response = await fetch('/api/placement-executives', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(result);
        console.log('Placement Executive created:', result.data);
        // Reset form on success
        setFormData({
          full_name: '',
          mobile_number: '',
          email: '',
          joining_date: '',
          employment_type: [],
          facility_types_handled: [],
          login_userID: '',
          login_password: '',
          photograph: null,
        });
        // Clear file input
        document.getElementById('photograph').value = '';
      } else {
        setError(result.message || 'Failed to create placement executive');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pe-form-container">
      <h2>Create Placement Executive</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success.message}</div>}

      <form onSubmit={handleSubmit}>
        {/* Required Fields */}
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Mobile Number *</label>
          <input
            type="tel"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            placeholder="0412345678"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>

        <div className="form-group">
          <label>Joining Date *</label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            required
          />
        </div>

        {/* Employment Type */}
        <div className="form-group">
          <label>Employment Type *</label>
          <div className="checkbox-group">
            {employmentTypeOptions.map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.employment_type.includes(type)}
                  onChange={() => handleEmploymentTypeChange(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Facility Types Handled */}
        <div className="form-group">
          <label>Facility Types Handled</label>
          <div className="checkbox-group">
            {facilityTypeOptions.map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.facility_types_handled.includes(type)}
                  onChange={() => handleFacilityTypeChange(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Login Credentials */}
        <div className="form-group">
          <label>User ID *</label>
          <input
            type="text"
            name="login_userID"
            value={formData.login_userID}
            onChange={handleChange}
            placeholder="Enter login ID"
            required
          />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="login_password"
            value={formData.login_password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </div>

        {/* Photograph */}
        <div className="form-group">
          <label>Photograph</label>
          <input
            id="photograph"
            type="file"
            name="photograph"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
          <small>Allowed: JPEG, PNG, GIF, WebP (max 5MB)</small>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Placement Executive'}
          </button>
        </div>
      </form>

      <style>{`
        .pe-form-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }

        .pe-form-container h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }

        .pe-form-container .form-group {
          margin-bottom: 15px;
        }

        .pe-form-container label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }

        .pe-form-container input[type="text"],
        .pe-form-container input[type="email"],
        .pe-form-container input[type="tel"],
        .pe-form-container input[type="date"],
        .pe-form-container input[type="password"],
        .pe-form-container input[type="file"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .pe-form-container .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .pe-form-container .checkbox-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: normal;
          margin-bottom: 0;
          padding: 8px 12px;
          background-color: #f5f5f5;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .pe-form-container .checkbox-label:hover {
          background-color: #e0e0e0;
        }

        .pe-form-container .checkbox-label input[type="checkbox"] {
          width: auto;
          margin: 0;
        }

        .pe-form-container .form-actions {
          text-align: center;
          margin-top: 20px;
        }

        .pe-form-container button[type="submit"] {
          background-color: #28a745;
          color: white;
          padding: 12px 40px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .pe-form-container button[type="submit"]:hover {
          background-color: #218838;
        }

        .pe-form-container button[type="submit"]:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .pe-form-container .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .pe-form-container .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .pe-form-container small {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default PlacementExecutiveCreateForm;
