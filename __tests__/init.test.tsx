import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

test('Home page renders title', () => {
  render(<Home />)
  expect(screen.getByRole('heading', { name: /Ultimate Dashboard/i })).toBeDefined()
})
