import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { Eye, Download, Trash2, X, Plus, Edit, Search, BarChart2, Send, Trophy } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

// Get SMTP settings from environment variables
const SMTP_HOST = import.meta.env.SMTP_HOST;
const SMTP_PORT = import.meta.env.SMTP_PORT;
const SMTP_USER = import.meta.env.SMTP_USER;
const SMTP_PASS = import.meta.env.SMTP_PASS;
const EMAIL_FROM = import.meta.env.EMAIL_FROM;

function ManageEmployeeVoting() {
  // State for employee votings
  const [employeeVotings, setEmployeeVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isAllResultsModalOpen, setIsAllResultsModalOpen] = useState(false);
  const [isPublishAllConfirmModalOpen, setIsPublishAllConfirmModalOpen] = useState(false);
  const [isOverallTopPerformerModalOpen, setIsOverallTopPerformerModalOpen] = useState(false);
  
  // State for selected voting
  const [selectedVoting, setSelectedVoting] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedVotingForView, setSelectedVotingForView] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    voting_period_id: '',
    employee_ids: [],
    department: '',
    department_email: '',
    criteria: {}
  });
  
  // State for available periods and employees
  const [votingPeriods, setVotingPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  
  // State for publish status
  const [publishStatus, setPublishStatus] = useState({});
  
  // Group employee votings by department
  const groupedVotings = useMemo(() => {
    return employeeVotings.reduce((acc, voting) => {
      const department = voting.department || 'Unassigned';
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(voting);
      return acc;
    }, {});
  }, [employeeVotings]);
  
  // Get unique departments
  const departments = useMemo(() => {
    return Object.keys(groupedVotings);
  }, [groupedVotings]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchEmployeeVotings();
    fetchVotingPeriods();
    fetchEmployees();
  }, []);
  
  // Update employee votings when employees or voting periods change
  useEffect(() => {
    if (employeeVotings.length > 0) {
      const updatedVotings = employeeVotings.map(voting => ({
        ...voting,
        employee: voting.employee || employees.find(emp => emp.id === voting.employee_id),
        votingPeriod: voting.votingPeriod || votingPeriods.find(period => period.id === voting.voting_period_id)
      }));
      setEmployeeVotings(updatedVotings);
    }
  }, [employees, votingPeriods]);
  
  // Fetch all employee votings
  const fetchEmployeeVotings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}voting/employee-votings`);
      console.log('Fetched employee votings:', response.data);
      
      let votingsData;
      if (response.data && response.data.data) {
        votingsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        votingsData = response.data;
      } else if (response.data && Array.isArray(response.data.employeeVotings)) {
        votingsData = response.data.employeeVotings;
      } else {
        votingsData = [];
      }
      
      console.log('Processed votings data:', votingsData);
      setEmployeeVotings(votingsData);
    } catch (error) {
      console.error('Error fetching employee votings:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to load employee votings');
      setEmployeeVotings([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all voting periods
  const fetchVotingPeriods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}voting/periods`);
      console.log('Voting Periods Response:', response.data);
      
      let periodsData = [];
      if (response.data && response.data.votingPeriods && Array.isArray(response.data.votingPeriods)) {
        periodsData = response.data.votingPeriods;
      } else if (response.data && Array.isArray(response.data)) {
        periodsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        periodsData = response.data.data;
      }

      // Log the criteria for debugging
      periodsData.forEach(period => {
        console.log(`Period ${period.voting_year} criteria:`, period.criteria);
      });
      
      setVotingPeriods(periodsData);
    } catch (error) {
      console.error('Error fetching voting periods:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load voting periods');
      setVotingPeriods([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}employees`);
      console.log('Employees Response:', response.data);
      
      let employeesData = [];
      if (response.data && Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (response.data && Array.isArray(response.data.employees)) {
        employeesData = response.data.employees;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        employeesData = response.data.data;
      }
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load employees');
      setEmployees([]);
    }
  };
  
  // Filter employee votings based on search term
  const filteredVotings = Array.isArray(employeeVotings) 
    ? employeeVotings.filter(voting => {
        const employee = employees.find(emp => emp.id === voting.employee_id);
        const period = votingPeriods.find(period => period.id === voting.voting_period_id);
        
        const employeeName = employee ? `${employee.firstname} ${employee.lastname}`.toLowerCase() : '';
        const periodYear = period ? period.voting_year.toString() : '';
        const department = voting.department ? voting.department.toLowerCase() : '';
        
        return (
          employeeName.includes(searchTerm.toLowerCase()) ||
          periodYear.includes(searchTerm.toLowerCase()) ||
          department.includes(searchTerm.toLowerCase()) ||
          voting.id.toString().includes(searchTerm)
        );
      })
    : [];
  
  // Handle create modal open
  const handleCreateModalOpen = () => {
    setFormData({
      voting_period_id: '',
      department: '',
      department_email: '',
      criteria: {}
    });
    setSelectedEmployees([]);
    setIsCreateModalOpen(true);
  };
  
  // Handle edit modal open
  const handleEditModalOpen = (voting) => {
    setSelectedVoting(voting);
    setFormData({
      voting_period_id: voting.voting_period_id,
      employee_ids: [voting.employee_id],
      department: voting.department || '',
      department_email: voting.department_email || '',
      criteria: voting.criteria
    });
    setSelectedEmployees([voting.employee_id]);
    setIsEditModalOpen(true);
  };
  
  // Handle delete modal open
  const handleDeleteModalOpen = (voting) => {
    setSelectedVoting(voting);
    setIsDeleteModalOpen(true);
  };
  
  // Handle view modal open
  const handleViewModalOpen = (voting) => {
    setSelectedVotingForView(voting);
    setIsViewModalOpen(true);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle voting period change
  const handleVotingPeriodChange = (e) => {
    const periodId = e.target.value;
    const period = votingPeriods.find(p => p.id === parseInt(periodId));
    console.log('Selected period:', period);
    
    if (!period) {
      console.error('Period not found:', periodId);
      return;
    }
    
    const criteria = period.criteria || {};
    console.log('Period criteria:', criteria);
    
    setFormData(prev => ({
      ...prev,
      voting_period_id: periodId,
      criteria: Object.fromEntries(Object.entries(criteria).map(([key, maxPoints]) => [key, '']))
    }));
  };
  
  // Handle employee selection
  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };
  
  // Handle criteria change
  const handleCriteriaChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [name]: parseInt(value)
      }
    }));
  };
  
  // Handle create employee voting
  const handleCreate = async () => {
    try {
      if (!formData.voting_period_id) {
        toast.error('Please select a voting period');
        return;
      }

      if (selectedEmployees.length === 0) {
        toast.error('Please select at least one employee');
        return;
      }

      if (!formData.department) {
        toast.error('Please enter the department');
        return;
      }

      if (!formData.department_email) {
        toast.error('Please enter the department email');
        return;
      }

      // Validate criteria values
      const periodCriteria = getVotingPeriodCriteria(formData.voting_period_id);
      for (const [criteriaName, maxPoints] of Object.entries(periodCriteria)) {
        const value = formData.criteria[criteriaName];
        if (value === undefined || value === '') {
          toast.error(`Please enter a value for ${criteriaName}`);
          return;
        }
        if (parseInt(value) > maxPoints) {
          toast.error(`${criteriaName} cannot exceed ${maxPoints} points`);
          return;
        }
      }
      
      // Create voting for each selected employee
      const promises = selectedEmployees.map(employeeId => {
        return axios.post(`${API_URL}voting/employee-votings`, {
          voting_period_id: formData.voting_period_id,
          employee_id: employeeId,
          department: formData.department,
          department_email: formData.department_email,
          criteria: formData.criteria
        });
      });
      
      await Promise.all(promises);
      toast.success('Employee votings created successfully');
      setIsCreateModalOpen(false);
      setFormData({
        voting_period_id: '',
        department: '',
        department_email: '',
        criteria: {}
      });
      setSelectedEmployees([]);
      fetchEmployeeVotings();
    } catch (error) {
      console.error('Error creating employee voting:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to create employee voting');
    }
  };
  
  // Handle update employee voting
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}voting/employee-votings/${selectedVoting.id}`, {
        voting_period_id: formData.voting_period_id,
        employee_id: selectedEmployees[0], // For edit, we only allow one employee
        department: formData.department,
        department_email: formData.department_email,
        criteria: formData.criteria
      });
      toast.success('Employee voting updated successfully');
      setIsEditModalOpen(false);
      fetchEmployeeVotings();
    } catch (error) {
      console.error('Error updating employee voting:', error);
      toast.error('Failed to update employee voting');
    }
  };
  
  // Handle delete employee voting
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}voting/employee-votings/${selectedVoting.id}`);
      toast.success('Employee voting deleted successfully');
      setIsDeleteModalOpen(false);
      fetchEmployeeVotings();
    } catch (error) {
      console.error('Error deleting employee voting:', error);
      toast.error('Failed to delete employee voting');
    }
  };
  
  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown Employee';
  };
  
  // Get voting period year by ID
  const getVotingPeriodYear = (periodId) => {
    const period = votingPeriods.find(period => period.id === periodId);
    return period ? period.voting_year : 'Unknown Period';
  };
  
  // Get criteria for a voting period
  const getVotingPeriodCriteria = (periodId) => {
    const period = votingPeriods.find(p => p.id === parseInt(periodId));
    if (!period) {
      console.log('Period not found:', periodId);
      return {};
    }
    if (!period.criteria) {
      console.log('No criteria found for period:', period.voting_year);
      return {};
    }
    console.log('Found criteria for period:', period.voting_year, period.criteria);
    return period.criteria;
  };
  
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  // Format date and time helper function
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'N/A';
    }
  };
  
  // Handle department view
  const handleDepartmentView = (department) => {
    setSelectedDepartment(department);
    setIsEmployeeModalOpen(true);
  };
  
  // Calculate department results
  const calculateDepartmentResults = (department) => {
    const votings = groupedVotings[department] || [];
    
    // Group by employee
    const employeeResults = votings.reduce((acc, voting) => {
      const employeeId = voting.employee_id;
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee: voting.employee || employees.find(emp => emp.id === employeeId),
          totalPoints: 0,
          criteria: {}
        };
      }
      
      // Sum up criteria points
      Object.entries(voting.criteria || {}).forEach(([criteria, points]) => {
        if (!acc[employeeId].criteria[criteria]) {
          acc[employeeId].criteria[criteria] = 0;
        }
        acc[employeeId].criteria[criteria] += parseInt(points) || 0;
        acc[employeeId].totalPoints += parseInt(points) || 0;
      });
      
      return acc;
    }, {});
    
    // Convert to array and sort by total points
    return Object.values(employeeResults).sort((a, b) => b.totalPoints - a.totalPoints);
  };
  
  // Handle result modal open
  const handleResultModalOpen = (department) => {
    setSelectedDepartment(department);
    setIsResultModalOpen(true);
  };
  
  // Handle publish modal open
  const handlePublishModalOpen = (department) => {
    setSelectedDepartment(department);
    setIsPublishModalOpen(true);
  };
  
  // Function to send email using SMTP settings
  const sendEmail = async (to, subject, message) => {
    try {
      // Create a simple email payload
      const emailData = {
        to,
        subject,
        message
      };

      // Log the email data (excluding sensitive information)
      console.log('Sending email with data:', {
        ...emailData
      });

      // Make the API call to send the email
      // Using the voting API endpoint since it's related to voting results
      const response = await axios.post(`${API_URL}voting/send-email`, emailData);
      
      if (response.data && response.data.success) {
        console.log('Email sent successfully');
        return true;
      } else {
        console.error('Failed to send email:', response.data?.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error.response?.data?.message || error.message);
      return false;
    }
  };
  
  // Handle publish results
  const handlePublishResults = async (department) => {
    try {
      setPublishStatus(prev => ({ ...prev, [department]: 'publishing' }));
      
      // Get all employees in the department with their voting IDs
      const departmentVotings = groupedVotings[department] || [];
      const employeeData = departmentVotings.map(voting => {
        const employee = employees.find(emp => emp.id === voting.employee_id);
        return {
          email: employee?.email,
          votingId: voting.id,
          employeeId: voting.employee_id
        };
      }).filter(data => data.email); // Remove any undefined emails

      if (employeeData.length === 0) {
        toast.error('No employee emails found for this department');
        setPublishStatus(prev => ({ ...prev, [department]: 'error' }));
        return;
      }

      // Send personalized email to each employee with their voting link
      const emailPromises = employeeData.map(async ({ email, votingId, employeeId }) => {
        const votingUrl = `${window.location.origin}/employee-voting/${votingId}?employeeId=${employeeId}`;
        const emailSubject = `Update Your Performance Marks - ${department} Department`;
        const emailMessage = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Performance Evaluation Update</h2>
            <p>You have been invited to update your performance marks for the ${department} department.</p>
            <p>Please click the link below to access your evaluation form:</p>
            <p><a href="${votingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Update Performance Marks</a></p>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this URL into your browser:</p>
            <p style="color: #666; font-size: 14px;">${votingUrl}</p>
          </div>
        `;

        return sendEmail(
          email,
          emailSubject,
          emailMessage
        );
      });

      // Wait for all emails to be sent
      const emailResults = await Promise.all(emailPromises);
      const successfulSends = emailResults.filter(result => result);

      if (successfulSends.length > 0) {
        toast.success(`Voting links sent to ${successfulSends.length} employees in ${department}`);
        setPublishStatus(prev => ({ ...prev, [department]: 'published' }));
        setIsPublishModalOpen(false);
      } else {
        toast.error(`Failed to send voting links to ${department} employees. Please try again later.`);
        setPublishStatus(prev => ({ ...prev, [department]: 'error' }));
      }
    } catch (error) {
      console.error('Error in publish process:', error);
      toast.error('Failed to complete the publishing process');
      setPublishStatus(prev => ({ ...prev, [department]: 'error' }));
    }
  };
  
  // Calculate all department results
  const calculateAllDepartmentResults = () => {
    const allResults = {};
    
    departments.forEach(department => {
      const results = calculateDepartmentResults(department);
      if (results.length > 0) {
        allResults[department] = results[0]; // Get the top performer
      }
    });
    
    return allResults;
  };
  
  // Handle publish all results
  const handlePublishAllResults = async () => {
    try {
      const allResults = calculateAllDepartmentResults();
      const departmentsWithResults = Object.keys(allResults);
      
      if (departmentsWithResults.length === 0) {
        toast.error('No voting data available for any department');
        return;
      }
      
      // Set all departments to publishing status
      const newPublishStatus = { ...publishStatus };
      departmentsWithResults.forEach(dept => {
        newPublishStatus[dept] = 'publishing';
      });
      setPublishStatus(newPublishStatus);

      // Collect all department emails
      const departmentEmails = new Set();
      const allVotingLinks = [];

      // Gather all voting links and department emails
      for (const department of departmentsWithResults) {
        const departmentVotings = groupedVotings[department] || [];
        const departmentEmail = departmentVotings[0]?.department_email;
        
        if (departmentEmail) {
          departmentEmails.add(departmentEmail);
          
          // Add department header
          allVotingLinks.push({
            type: 'header',
            department: department
          });

          // Add all employee links for this department
          departmentVotings.forEach(voting => {
            const employee = employees.find(emp => emp.id === voting.employee_id);
            const votingUrl = `${window.location.origin}/employee-voting/${voting.id}?employeeId=${voting.employee_id}`;
            allVotingLinks.push({
              type: 'link',
              name: employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown Employee',
              link: votingUrl
            });
          });
        }
      }

      if (departmentEmails.size === 0) {
        toast.error('No valid department emails found');
        return;
      }

      // Create email content with all voting links
      const emailSubject = 'Employee Voting Links - All Departments';
      const emailMessage = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Employee Voting Links</h2>
          <p>Below are the voting links for all employees across all departments:</p>
          <div style="margin-top: 20px;">
            ${allVotingLinks.map(item => {
              if (item.type === 'header') {
                return `
                  <h3 style="margin: 20px 0 10px 0; color: #1a56db; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">
                    ${item.department} Department
                  </h3>
                `;
              } else {
                return `
                  <div style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
                    <p style="margin: 0 0 5px 0;"><strong>${item.name}</strong></p>
                    <p style="margin: 0;"><a href="${item.link}" style="color: #2563eb; text-decoration: none;">${item.link}</a></p>
                  </div>
                `;
              }
            }).join('')}
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Please distribute these links to the respective employees in your department.
          </p>
        </div>
      `;

      // Send the email to all department emails
      const emailPromises = Array.from(departmentEmails).map(async (email) => {
        const emailSent = await sendEmail(email, emailSubject, emailMessage);
        return { email, success: emailSent };
      });

      const results = await Promise.all(emailPromises);
      
      // Update status based on results
      results.forEach(({ email, success }) => {
        const department = departmentsWithResults.find(dept => {
          const votings = groupedVotings[dept] || [];
          return votings[0]?.department_email === email;
        });
        
        if (department) {
          newPublishStatus[department] = success ? 'published' : 'error';
        }
      });

      setPublishStatus(newPublishStatus);
      
      // Show success/error messages
      const successfulSends = results.filter(r => r.success).length;
      if (successfulSends > 0) {
        toast.success(`Voting links sent to ${successfulSends} department${successfulSends > 1 ? 's' : ''}`);
      }
      if (successfulSends < results.length) {
        toast.error(`Failed to send to ${results.length - successfulSends} department${results.length - successfulSends > 1 ? 's' : ''}`);
      }
      
      setIsAllResultsModalOpen(false);
      setIsPublishAllConfirmModalOpen(false);
    } catch (error) {
      console.error('Error publishing all results:', error);
      toast.error('Failed to publish all results');
    }
  };
  
  // Handle all results modal open
  const handleAllResultsModalOpen = () => {
    setIsAllResultsModalOpen(true);
  };
  
  // Handle publish all confirmation modal open
  const handlePublishAllConfirmModalOpen = () => {
    setIsPublishAllConfirmModalOpen(true);
  };
  
  // Helper functions for criteria calculations
  const calculateCriteriaPoints = (criteria) => {
    const criteriaPoints = {};
    
    if (Array.isArray(criteria)) {
      // Handle array format
      criteria.forEach(item => {
        const name = item.name;
        if (!criteriaPoints[name]) {
          criteriaPoints[name] = 0;
        }
        criteriaPoints[name] += Number(item.points) || 0;
      });
    } else if (typeof criteria === 'object' && criteria !== null) {
      // Handle object format
      Object.entries(criteria).forEach(([name, points]) => {
        if (typeof points === 'object') {
          criteriaPoints[name] = Number(points.points) || 0;
        } else {
          criteriaPoints[name] = Number(points) || 0;
        }
      });
    }
    
    return criteriaPoints;
  };

  const calculateTotalPoints = (criteria) => {
    const points = calculateCriteriaPoints(criteria);
    return Object.values(points).reduce((sum, point) => sum + point, 0);
  };

  const renderCriteriaTable = (criteria) => {
    const criteriaPoints = calculateCriteriaPoints(criteria);
    const totalPoints = Object.values(criteriaPoints).reduce((sum, points) => sum + points, 0);

    return (
      <>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Criteria</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.entries(criteriaPoints).map(([name, points]) => (
              <tr key={name}>
                <td className="px-4 py-2 text-sm text-gray-900">{name}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{points}</td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-4 py-2 text-sm font-medium text-gray-900">Total Points</td>
              <td className="px-4 py-2 text-sm font-medium text-indigo-600">{totalPoints}</td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  const calculateOverallTopPerformer = () => {
    let topPerformer = null;
    let maxTotalPoints = -1;

    Object.values(groupedVotings).forEach(departmentVotings => {
      departmentVotings.forEach(voting => {
        const totalPoints = calculateTotalPoints(voting.criteria);
        
        if (totalPoints > maxTotalPoints) {
          maxTotalPoints = totalPoints;
          topPerformer = {
            ...voting,
            totalPoints,
            criteriaBreakdown: calculateCriteriaPoints(voting.criteria)
          };
        }
      });
    });

    return topPerformer;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Employee Votings</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsOverallTopPerformerModalOpen(true)} 
            variant="outline"
            className="bg-purple-100 hover:bg-purple-200 text-purple-700"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Overall Top Performer
          </Button>
          <Button onClick={handleAllResultsModalOpen} variant="outline">
            <Trophy className="w-4 h-4 mr-2" />
            All Top Performers
          </Button>
          <Button onClick={handleCreateModalOpen}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Voting
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search by department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments
                .filter(dept => dept.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((department) => (
                <tr key={department}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {groupedVotings[department]?.length || 0} employees
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDepartmentView(department)}
                        title="View Employees"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResultModalOpen(department)}
                        title="View Results"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePublishModalOpen(department)}
                        title="Publish Results"
                        disabled={publishStatus[department] === 'publishing'}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsViewModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Employee Voting Details
                </Dialog.Title>

                {selectedVotingForView && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Employee</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedVotingForView.employee?.firstname} {selectedVotingForView.employee?.lastname}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Department</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedVotingForView.department}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Department Email</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedVotingForView.department_email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Voting Period</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedVotingForView.votingPeriod?.voting_year}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Created Date</h4>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedVotingForView.created_at)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Criteria</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {selectedVotingForView && renderCriteriaTable(selectedVotingForView.criteria)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Department Employee Modal */}
      <Transition appear show={isEmployeeModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsEmployeeModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  {selectedDepartment} - Employee Votings
                </Dialog.Title>

                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voting Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupedVotings[selectedDepartment]?.map((voting) => (
                        <tr key={voting.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {voting.employee?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {voting.votingPeriod ? voting.votingPeriod.voting_year : getVotingPeriodYear(voting.voting_period_id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(voting.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewModalOpen(voting)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditModalOpen(voting)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteModalOpen(voting)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsEmployeeModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Create Modal */}
      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsCreateModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Create New Employee Voting
                </Dialog.Title>

                <div className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Voting Period
                      </label>
                      <select
                        name="voting_period_id"
                        value={formData.voting_period_id}
                        onChange={handleVotingPeriodChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select Period</option>
                        {votingPeriods.map((period) => (
                          <option key={period.id} value={period.id}>
                            {period.voting_year} ({new Date(period.from_date).toLocaleDateString()} - {new Date(period.to_date).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <Input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Enter department"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department Email
                      </label>
                      <Input
                        type="email"
                        name="department_email"
                        value={formData.department_email}
                        onChange={handleInputChange}
                        placeholder="Enter department email"
                        className="mt-1"
                        required
                      />
                    </div>

                    {formData.voting_period_id && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Employees
                          </label>
                          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {employees.map((employee) => (
                              <div key={employee.id} className="flex items-center py-1">
                                <input
                                  type="checkbox"
                                  id={`employee-${employee.firstname}-${employee.lastname}`}
                                  checked={selectedEmployees.includes(employee.id)}
                                  onChange={() => handleEmployeeSelection(employee.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`employee-${employee.firstname}-${employee.lastname}`} className="ml-2 block text-sm text-gray-900">
                                  {employee.firstname} {employee.lastname}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Criteria</h4>
                          {formData.voting_period_id && Object.entries(getVotingPeriodCriteria(formData.voting_period_id)).map(([criteriaName, maxPoints], index) => (
                            <div key={index} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                {criteriaName} (Max: {maxPoints} points)
                              </label>
                              <Input
                                type="number"
                                name={criteriaName}
                                value={formData.criteria[criteriaName] || ''}
                                onChange={(e) => handleCriteriaChange(criteriaName, e.target.value)}
                                className="mt-1"
                                min="0"
                                max={maxPoints}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={!formData.voting_period_id || selectedEmployees.length === 0 || !formData.department || !formData.department_email}
                  >
                    Create
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsEditModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Edit Employee Voting
                </Dialog.Title>

                <div className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Voting Period
                      </label>
                      <select
                        name="voting_period_id"
                        value={formData.voting_period_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select Period</option>
                        {votingPeriods.map((period) => (
                          <option key={period.id} value={period.id}>
                            {period.voting_year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <Input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Enter department"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department Email
                      </label>
                      <Input
                        type="email"
                        name="department_email"
                        value={formData.department_email}
                        onChange={handleInputChange}
                        placeholder="Enter department email"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee
                      </label>
                      <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                        {employees.map((employee) => (
                          <div key={employee.id} className="flex items-center py-1">
                            <input
                              type="checkbox"
                              id={`edit-employee-${employee.firstname}-${employee.lastname}`}
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={() => handleEmployeeSelection(employee.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`edit-employee-${employee.firstname}-${employee.lastname}`} className="ml-2 block text-sm text-gray-900">
                              {employee.firstname} {employee.lastname}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.voting_period_id && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Criteria</h4>
                        {Object.entries(getVotingPeriodCriteria(formData.voting_period_id)).map(([criteriaName, maxPoints], index) => (
                          <div key={index} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {criteriaName}
                            </label>
                            <Input
                              type="number"
                              name={criteriaName}
                              value={formData.criteria?.[criteriaName] || ''}
                              onChange={(e) => handleCriteriaChange(criteriaName, e.target.value)}
                              className="mt-1"
                              min="0"
                              max={maxPoints}
                              placeholder={`Max points: ${maxPoints}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={!formData.voting_period_id || selectedEmployees.length === 0 || !formData.department || !formData.department_email}
                  >
                    Update
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Delete Employee Voting
                </Dialog.Title>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this employee voting? This action cannot be undone.
                  </p>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Result Modal */}
      <Transition appear show={isResultModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsResultModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  {selectedDepartment} - Top Performer
                </Dialog.Title>

                <div className="mt-4">
                  {(() => {
                    const results = calculateDepartmentResults(selectedDepartment);
                    if (results.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          No voting data available for this department.
                        </div>
                      );
                    }
                    
                    const topPerformer = results[0];
                    
                    return (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">
                              {topPerformer.employee?.email || 'Email not available'}
                            </h4>
                            <p className="text-sm text-gray-500">Top Performer</p>
                          </div>
                        </div>
                        
                        {results.length > 1 && (
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                              This employee has the highest score among {results.length} employees in this department.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsResultModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Publish Modal */}
      <Transition appear show={isPublishModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsPublishModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Send Voting Links - {selectedDepartment}
                </Dialog.Title>

                <div className="mt-4">
                  {(() => {
                    const departmentVotings = groupedVotings[selectedDepartment] || [];
                    const employeeData = departmentVotings.map(voting => {
                      const employee = employees.find(emp => emp.id === voting.employee_id);
                      return {
                        email: employee?.email,
                        name: employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown Employee'
                      };
                    }).filter(data => data.email);

                    if (employeeData.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          No employee emails found for this department.
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium text-gray-900 mb-2">Recipients</h4>
                          <div className="max-h-60 overflow-y-auto">
                            {employeeData.map((employee, index) => (
                              <div key={index} className="py-2 border-b border-gray-200 last:border-0">
                                <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                                <p className="text-sm text-blue-600">{employee.email}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Total: {employeeData.length} employee{employeeData.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            Each employee will receive an email with a personalized link to update their performance marks.
                            They will be able to access their evaluation form directly through this link.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsPublishModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handlePublishResults(selectedDepartment)}
                    disabled={publishStatus[selectedDepartment] === 'publishing'}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send Voting Links
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* All Results Modal */}
      <Transition appear show={isAllResultsModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsAllResultsModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  All Department Top Performers
                </Dialog.Title>

                <div className="mt-4">
                  {(() => {
                    const allResults = calculateAllDepartmentResults();
                    const departmentsWithResults = Object.keys(allResults);
                    
                    if (departmentsWithResults.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          No voting data available for any department.
                        </div>
                      );
                    }
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {departmentsWithResults.map(department => {
                          const topPerformer = allResults[department];
                          return (
                            <div key={department} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 shadow-md">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{department}</h4>
                                  <p className="text-sm text-gray-500">Top Performer</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-md font-medium text-blue-600">
                                    {topPerformer.employee?.email || 'Email not available'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    onClick={handlePublishAllConfirmModalOpen}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publish All Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAllResultsModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Publish All Confirmation Modal */}
      <Transition appear show={isPublishAllConfirmModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsPublishAllConfirmModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Confirm Publishing All Results
                </Dialog.Title>

                <div className="mt-4">
                  {(() => {
                    const allResults = calculateAllDepartmentResults();
                    const departmentsWithResults = Object.keys(allResults);
                    
                    if (departmentsWithResults.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          No voting data available for any department.
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-md">
                          <p className="text-sm text-yellow-800">
                            You are about to publish results for all departments. 
                            Each department will receive an email containing all voting links for their employees.
                            This action cannot be undone.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Department Emails</h4>
                          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department Email</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee Count</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {departmentsWithResults.map(department => {
                                  const departmentVotings = groupedVotings[department] || [];
                                  const departmentEmail = departmentVotings[0]?.department_email || 'Email not available';
                                  const employeeCount = departmentVotings.length;
                                  
                                  return (
                                    <tr key={department}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{department}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{departmentEmail}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{employeeCount} employees</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsPublishAllConfirmModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePublishAllResults}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publish All
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Overall Top Performer Modal */}
      <Transition appear show={isOverallTopPerformerModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsOverallTopPerformerModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-gray-900 mb-4"
                >
                  Overall Top Performer
                </Dialog.Title>

                {(() => {
                  const topPerformer = calculateOverallTopPerformer();
                  
                  if (!topPerformer) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        No voting data available.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 shadow-md">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Employee</h4>
                            <p className="mt-1 text-lg font-semibold text-gray-900">
                              {topPerformer.employee?.firstname} {topPerformer.employee?.lastname}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Department</h4>
                            <p className="mt-1 text-lg font-semibold text-purple-600">
                              {topPerformer.department}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Total Points</h4>
                            <p className="mt-1 text-2xl font-bold text-indigo-600">
                              {topPerformer.totalPoints}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Email</h4>
                            <p className="mt-1 text-sm text-gray-600">
                              {topPerformer.employee?.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Performance Breakdown</h4>
                          <div className="bg-white rounded-lg p-4">
                            {topPerformer && renderCriteriaTable(topPerformer.criteria)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsOverallTopPerformerModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default ManageEmployeeVoting;
