import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './layouts/Home'
import { TermLayout } from './layouts/Term'

function App() {
  return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/term/:term" element={<TermLayout />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App
