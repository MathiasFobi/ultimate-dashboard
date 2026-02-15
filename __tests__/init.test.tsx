import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

test('Home page renders Overview title', () => {
  render(<Home />)
  expect(screen.getByRole('heading', { name: /Overview/i })).toBeDefined()
})
