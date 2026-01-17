import { useState } from 'react'

// import viteLogo from '/vite.svg'
import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <h1>Welcome to the app</h1>
     <signedOut>
      <SignInButton mode="modal">
      <button>Login</button>
      </SignInButton>
     </signedOut>

     <SignedIn>
      <SignOutButton />
     </SignedIn>

     <UserButton />
    </>
  )
}

export default App
