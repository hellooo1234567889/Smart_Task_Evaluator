// BROKEN: This component has multiple issues
/*import { useState } from 'react'

export default function BrokenCounter() {
  const [count, setCount] = useState(0)
  
  // BUG: Infinite loop - missing dependency array
  useEffect(() => {
    setCount(count + 1)
  })
  
  // BUG: Wrong event handler
  const handleClick = () => {
    count = count + 1  // Direct mutation instead of setState
  }
  
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onclick={handleClick}>Increment</button>
    </div>
  )
}*/
