import React, { useState } from 'react';

function TrainerCreateForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    mobile_number: '',
    alternate_contact: '',
    email: '',
    trainer_type: [],
    course_auth: [],
    acc_numbers: '',
    yoe: '',
    state_covered: [],
    cities_covered: [],
    available_days: [],
    time_slots: [],
    suprise_visit: false,
    wwchildcheck: 0,
    wwcExpiryDate: '',
    policeCheckNumber: '',
    policeCheckExpiryDate: '',
    login_userID: '',
    login_password: '',
    photograph: null,
  });

  // Trainer type options
  const trainerTypeOptions = ['Full-time', 'Part-time', 'Casual', 'Contract'];

  // State options
  const stateOptions = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

  // Day options
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Time slot options
  const timeSlotOptions = ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'];

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      handleCheckboxChange(name, value, checked);
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

  // Handle trainer type checkbox
  const handleTrainerTypeChange = (type) => {
    setFormData(prev => {
      const current = prev.trainer_type || [];
      if (current.includes(type)) {
        return { ...prev, trainer_type: current.filter(t => t !== type) };
      } else {
        return { ...prev, trainer_type: [...current, type] };
      }
    });
  };

  // Handle state checkbox
  const handleStateChange = (state) => {
    setFormData(prev => {
      const current = prev.state_covered || [];
      if (current.includes(state)) {
        return { ...prev, state_covered: current.filter(s => s !== state) };
      } else {
        return { ...prev, state_covered: [...current, state] };
      }
    });
  };

  // Handle day checkbox
  const handleDayChange = (day) => {
    setFormData(prev => {
      const current = prev.available_days || [];
      if (current.includes(day)) {
        return { ...prev, available_days: current.filter(d => d !== day) };
      } else {
        return { ...prev, available_days: [...current, day] };
      }
    });
  };

  // Handle time slot checkbox
  const handleTimeSlotChange = (slot) => {
    setFormData(prev => {
      const current = prev.time_slots || [];
      if (current.includes(slot)) {
        return { ...prev, time_slots: current.filter(s => s !== slot) };
      } else {
        return { ...prev, time_slots: [...current, slot] };
      }
    });
  };

  // Handle course auth input (comma-separated)
  const handleCourseAuthChange = (e) => {
    const value = e.target.value;
    const courses = value.split(',').map(c => c.trim()).filter(c => c);
    setFormData(prev => ({ ...prev, course_auth: courses }));
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
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('gender', formData.gender);
      data.append('date_of_birth', formData.date_of_birth);
      data.append('mobile_number', formData.mobile_number);
      data.append('email', formData.email);
      data.append('login[userID]', formData.login_userID);
      data.append('login[password]', formData.login_password);

      // Optional fields
      if (formData.alternate_contact) {
        data.append('alternate_contact', formData.alternate_contact);
      }
      if (formData.acc_numbers) {
        data.append('acc_numbers', formData.acc_numbers);
      }
      if (formData.yoe) {
        data.append('yoe', formData.yoe);
      }
      if (formData.suprise_visit !== undefined) {
        data.append('suprise_visit', formData.suprise_visit);
      }
      if (formData.wwchildcheck !== undefined) {
        data.append('wwchildcheck', formData.wwchildcheck);
      }
      if (formData.wwcExpiryDate) {
        data.append('wwcExpiryDate', formData.wwcExpiryDate);
      }
      if (formData.policeCheckNumber) {
        data.append('policeCheckNumber', formData.policeCheckNumber);
      }
      if (formData.policeCheckExpiryDate) {
        data.append('policeCheckExpiryDate', formData.policeCheckExpiryDate);
      }

      // Array fields
      formData.trainer_type.forEach(type => {
        data.append('trainer_type[]', type);
      });
      formData.course_auth.forEach(course => {
        data.append('course_auth[]', course);
      });
      formData.state_covered.forEach(state => {
        data.append('state_covered[]', state);
      });
      formData.cities_covered.forEach(city => {
        data.append('cities_covered[]', city);
      });
      formData.available_days.forEach(day => {
        data.append('available_days[]', day);
      });
      formData.time_slots.forEach(slot => {
        data.append('time_slots[]', slot);
      });

      // File
      if (formData.photograph) {
        data.append('photograph', formData.photograph);
      }

      // Get auth token (adjust based on your auth implementation)
      const token = localStorage.getItem('authToken') || '';

      // Send request
      const response = await fetch('/api/trainers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(result);
        console.log('Trainer created:', result.data);
        // Reset form on success
        setFormData({
          first_name: '',
          last_name: '',
          gender: '',
          date_of_birth: '',
          mobile_number: '',
          alternate_contact: '',
          email: '',
          trainer_type: [],
          course_auth: [],
          acc_numbers: '',
          yoe: '',
          state_covered: [],
          cities_covered: [],
          available_days: [],
          time_slots: [],
          suprise_visit: false,
          wwchildcheck: 0,
          wwcExpiryDate: '',
          policeCheckNumber: '',
          policeCheckExpiryDate: '',
          login_userID: '',
          login_password: '',
          photograph: null,
        });
      } else {
        setError(result.message || 'Failed to create trainer');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trainer-form-container">
      <h2>Create Trainer</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success.message}</div>}

      <form onSubmit={handleSubmit}>
        {/* Required Fields */}
        <fieldset>
          <legend>Required Information</legend>

          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date of Birth *</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
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
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </fieldset>

        {/* Trainer Details */}
        <fieldset>
          <legend>Trainer Details</legend>

          <div className="form-group">
            <label>Trainer Type</label>
            <div className="checkbox-group">
              {trainerTypeOptions.map(type => (
                <label key={type}>
                  <input
                    type="checkbox"
                    checked={formData.trainer_type.includes(type)}
                    onChange={() => handleTrainerTypeChange(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Course Authorizations (comma-separated)</label>
            <textarea
              placeholder="CHC33021 - Certificate III in Individual Support, CHC43021 - Certificate IV in Ageing Support"
              onChange={handleCourseAuthChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="yoe"
              value={formData.yoe}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Account Numbers</label>
            <input
              type="text"
              name="acc_numbers"
              value={formData.acc_numbers}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* Location */}
        <fieldset>
          <legend>Coverage Area</legend>

          <div className="form-group">
            <label>States Covered</label>
            <div className="checkbox-group">
              {stateOptions.map(state => (
                <label key={state}>
                  <input
                    type="checkbox"
                    checked={formData.state_covered.includes(state)}
                    onChange={() => handleStateChange(state)}
                  />
                  {state}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Available Days</label>
            <div className="checkbox-group">
              {dayOptions.map(day => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={formData.available_days.includes(day)}
                    onChange={() => handleDayChange(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Time Slots</label>
            <div className="checkbox-group">
              {timeSlotOptions.map(slot => (
                <label key={slot}>
                  <input
                    type="checkbox"
                    checked={formData.time_slots.includes(slot)}
                    onChange={() => handleTimeSlotChange(slot)}
                  />
                  {slot}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="suprise_visit"
                checked={formData.suprise_visit}
                onChange={(e) => setFormData(prev => ({ ...prev, suprise_visit: e.target.checked }))}
              />
              Available for Surprise Visits
            </label>
          </div>
        </fieldset>

        {/* Background Checks */}
        <fieldset>
          <legend>Background Checks</legend>

          <div className="form-group">
            <label>Working with Children Check</label>
            <select
              name="wwchildcheck"
              value={formData.wwchildcheck}
              onChange={handleChange}
            >
              <option value={0}>Pending</option>
              <option value={1}>Approved</option>
              <option value={2}>Expired</option>
            </select>
          </div>

          <div className="form-group">
            <label>WWC Expiry Date</label>
            <input
              type="date"
              name="wwcExpiryDate"
              value={formData.wwcExpiryDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Police Check Number</label>
            <input
              type="text"
              name="policeCheckNumber"
              value={formData.policeCheckNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Police Check Expiry Date</label>
            <input
              type="date"
              name="policeCheckExpiryDate"
              value={formData.policeCheckExpiryDate}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        {/* Photograph */}
        <fieldset>
          <legend>Photograph</legend>

          <div className="form-group">
            <label>Profile Photo</label>
            <input
              type="file"
              name="photograph"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
            />
            <small>Allowed: JPEG, PNG, GIF, WebP (max 5MB)</small>
          </div>
        </fieldset>

        {/* Login Credentials */}
        <fieldset>
          <legend>Login Credentials</legend>

          <div className="form-group">
            <label>User ID *</label>
            <input
              type="text"
              name="login_userID"
              value={formData.login_userID}
              onChange={handleChange}
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
              required
            />
          </div>
        </fieldset>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Trainer'}
          </button>
        </div>
      </form>

      <style>{`
        .trainer-form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .trainer-form-container fieldset {
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 20px;
          padding: 15px;
        }

        .trainer-form-container legend {
          font-weight: bold;
          padding: 0 10px;
        }

        .trainer-form-container .form-group {
          margin-bottom: 15px;
        }

        .trainer-form-container label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .trainer-form-container input[type="text"],
        .trainer-form-container input[type="email"],
        .trainer-form-container input[type="tel"],
        .trainer-form-container input[type="date"],
        .trainer-form-container input[type="number"],
        .trainer-form-container input[type="password"],
        .trainer-form-container select,
        .trainer-form-container textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .trainer-form-container .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }

        .trainer-form-container .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: normal;
        }

        .trainer-form-container .form-actions {
          text-align: center;
          margin-top: 20px;
        }

        .trainer-form-container button[type="submit"] {
          background-color: #007bff;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }

        .trainer-form-container button[type="submit"]:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .trainer-form-container .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .trainer-form-container .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

export default TrainerCreateForm;
