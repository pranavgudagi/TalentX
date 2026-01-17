import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

function App() {
  return (
    <>
     <h1>Welcome to TalentIQ</h1>
     <SignedOut>
      <SignInButton mode="modal">
        <button>Sign In</button>
      </SignInButton>
     </SignedOut>

     <SignedIn>
      <p>You are signed in!</p>
      <UserButton />
     </SignedIn>
    </>
  )
}

export default App
