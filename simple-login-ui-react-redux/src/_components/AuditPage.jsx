import React, { useState, useEffect } from 'react';
import Pagination from "react-js-pagination";
import { useNavigate } from 'react-router-dom';
const AuditPage = () => {
    const navigate = useNavigate()
    const [auditData, setAuditData] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 20;
    const user =  JSON.parse(localStorage.getItem('auth'))
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${user.token}`);
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

    
    useEffect(() => {
        if (!user || user.role !== 'Auditor') {
            navigate('/'); 
        }
        fetch("http://localhost:4000/users/audit", requestOptions)
            .then(response => response.json())
            .then(data => setAuditData(data))
            .catch(err => console.error("Error fetching data: ", err));
    }, [navigate,user]);

    return (
        <div>
            <h2>Audit Page</h2>
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Login Time</th>
                        <th>Logout Time</th>
                    </tr>
                </thead>
                <tbody>
                    {auditData.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map(entry => (
                        <tr key={entry._id}>
                            <td>{entry.userId.firstName}</td>
                            <td>{entry.userId.lastName}</td>
                            <td>{entry.userId.username}</td>
                            <td>{entry.userId.role}</td>
                            <td>{new Date(entry.loginTime).toLocaleString()}</td>
                            <td>{entry.logoutTime ? new Date(entry.logoutTime).toLocaleString() : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                activePage={activePage}
                itemsCountPerPage={itemsPerPage}
                totalItemsCount={auditData.length}
                pageRangeDisplayed={5}
                onChange={page => setActivePage(page)}
            />
        </div>
    );
}

export default AuditPage;
