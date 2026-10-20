import { createContext } from 'react'

// Own file so the provider file only exports a component (fast-refresh lint rule).
export const AuthContext = createContext(null)
