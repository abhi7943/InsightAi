import {createContext,useContext,useEffect,useState} from 'react';
import api from '../services/api';
const C=createContext(null);
export function AuthProvider({children}){const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{if(localStorage.getItem('insightai_token')) api.get('/auth/me').then(r=>setUser(r.data)).catch(()=>localStorage.removeItem('insightai_token')).finally(()=>setLoading(false)); else setLoading(false)},[]);
 const login=async(data)=>{const r=await api.post('/auth/login',data);localStorage.setItem('insightai_token',r.data.access_token);setUser(r.data.user)};
 const register=async(data)=>{const r=await api.post('/auth/register',data);localStorage.setItem('insightai_token',r.data.access_token);setUser(r.data.user)};
 const logout=()=>{localStorage.removeItem('insightai_token');setUser(null)};
 return <C.Provider value={{user,loading,login,register,logout}}>{children}</C.Provider>}
export const useAuth=()=>useContext(C);
