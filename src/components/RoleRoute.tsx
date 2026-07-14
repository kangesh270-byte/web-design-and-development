import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, UserRole } from '../context/AuthContext'
export function RoleRoute({role,children}:{role:UserRole;children:ReactNode}){const {user,role:userRole,loading}=useAuth();if(loading)return <div className="page-center">Loading...</div>;if(!user)return <Navigate to="/login" replace/>;if(userRole!==role)return <Navigate to={userRole==='admin'?'/':'/customer'} replace/>;return <>{children}</>}
