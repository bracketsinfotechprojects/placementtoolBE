import React, { useState } from 'react';
import axios from 'axios';

const TrainerCreateForm = () => {
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
    suprise_visit: 'no',
    wwchildcheck: '',
    wwcExpiryDate: '',
    policeCheckNumber: '',
    policeCheckExpiryDate: '',
    photograph: null,
    login: {
      userID: '',
      password: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested login object
    if (name.startsWith('login_')) {
      const loginField = name.replace('login_', '');
      setFormData(prev => ({
        ...prev,
        login: {
          ...prev.login,
          [loginField]: value
        }
      }));
      return;
    }

    // Handle array fields
    if (['trainer_type', 'course_auth', 'state_covered', 'cities_covered', 'available_days', 'time_slots'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photograph: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      
      // Create FormData for multipart/form-data
      const submitData = new FormData();
      
      // Flatten login object for FormData
      submitData.append('login', JSON.stringify(formData.login));
      
      // Append all other fields
      Object.keys(formData).forEach(key => {
        if (key !== 'login' && key !== 'photograph' && Array.isArray(formData[key])) {
          formData[key].forEach(item => {
            submitData.append(`${key}[]`, item);
          });
        } else if (key !== 'login' && key !== 'photograph') {
          submitData.append(key, formData[key]);
        }
      });

      if (formData.photograph) {
        submitData.append('photograph', formData.photograph);
      }

      const response = await axios.post('/api/trainers', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Trainer created successfully!' });
      console.log('Response:', response.data);
      
      // Reset form
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
        suprise_visit: 'no',
        wwchildcheck: '',
        wwcExpiryDate: '',
        policeCheckNumber: '',
        policeCheckExpiryDate: '',
        photograph: null,
        login: {
          userID: '',
          password: ''
        }
      });
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error?.message || 'Failed to create trainer' 
      });
      console.error('Error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trainer-form-container">
      <h2>Create New Trainer</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h3>Personal Information</h3>
        
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
            type="text"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Alternate Contact</label>
          <input
            type="text"
            name="alternate_contact"
            value={formData.alternate_contact}
            onChange={handleChange}
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

        <h3>Professional Information</h3>

        <div className="form-group">
          <label>Trainer Type (comma-separated)</label>
          <input
            type="text"
            name="trainer_type"
            value={formData.trainer_type.join(', ')}
            onChange={handleChange}
            placeholder="Full-time, Part-time, Contract"
          />
        </div>

        <div className="form-group">
          <label>Course Authorizations (comma-separated)</label>
          <input
            type="text"
            name="course_auth"
            value={formData.course_auth.join(', ')}
            onChange={handleChange}
            placeholder="CHC33021, CHC43021"
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

        <div className="form-group">
          <label>Years of Experience</label>
          <input
            type="number"
            name="yoe"
            value={formData.yoe}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>States Covered (comma-separated)</label>
          <input
            type="text"
            name="state_covered"
            value={formData.state_covered.join(', ')}
            onChange={handleChange}
            placeholder="NSW, VIC, QLD"
          />
        </div>

        <div className="form-group">
          <label>Cities Covered (comma-separated)</label>
          <input
            type="text"
            name="cities_covered"
            value={formData.cities_covered.join(', ')}
            onChange={handleChange}
            placeholder="Sydney, Melbourne, Brisbane"
          />
        </div>

        <div className="form-group">
          <label>Available Days (comma-separated)</label>
          <input
            type="text"
            name="available_days"
            value={formData.available_days.join(', ')}
            onChange={handleChange}
            placeholder="Monday, Tuesday, Wednesday"
          />
        </div>

        <div className="form-group">
          <label>Time Slots (comma-separated)</label>
          <input
            type="text"
            name="time_slots"
            value={formData.time_slots.join(', ')}
            onChange={handleChange}
            placeholder="09:00-12:00, 14:00-17:00"
          />
        </div>

        <div className="form-group">
          <label>Surprise Visit</label>
          <select name="suprise_visit" value={formData.suprise_visit} onChange={handleChange}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        <h3>Check Information</h3>

        <div className="form-group">
          <label>WW Child Check (0=Pending, 1=Approved, 2=Expired)</label>
          <input
            type="number"
            name="wwchildcheck"
            value={formData.wwchildcheck}
            onChange={handleChange}
            min="0"
            max="2"
          />
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

        <h3>Photograph</h3>

        <div className="form-group">
          <label>Photograph</label>
          <input
            type="file"
            name="photograph"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
        </div>

        <h3>Login Credentials</h3>

        <div className="form-group">
          <label>Login UserID *</label>
          <input
            type="text"
            name="login_userID"
            value={formData.login.userID}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Login Password *</label>
          <input
            type="password"
            name="login_password"
            value={formData.login.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Trainer'}
        </button>
      </form>

      <style jsx>{`
        .trainer-form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .trainer-form-container h2 {
          margin-bottom: 20px;
        }
        
        .trainer-form-container h3 {
          margin-top: 30px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .message {
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        button {
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }
        
        button:hover {
          background-color: #0056b3;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default TrainerCreateForm;
