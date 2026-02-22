/// <reference types="cypress" />
// Declare cy.mount globally for component tests (registered in cypress/support/component.ts at runtime)
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof import('cypress/react').mount
    }
  }
}
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from './NotFound'

// NotFound uses useLocation(), so it must be wrapped in a Router provider.
// We use MemoryRouter (not HashRouter/BrowserRouter) since Cypress mounts
// components in isolation without a real browser URL history.
describe('<NotFound />', () => {
  it('renders the 404 page correctly', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/some-nonexistent-page']}>
        <NotFound />
      </MemoryRouter>
    )
  })

  it('displays the 404 heading', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/missing']}>
        <NotFound />
      </MemoryRouter>
    )
    cy.get('h1').contains('404').should('be.visible')
  })

  it('contains a link back to home', () => {
    cy.mount(
      <MemoryRouter initialEntries={['/missing']}>
        <NotFound />
      </MemoryRouter>
    )
    cy.get('a').contains('Return to Home').should('have.attr', 'href', '/')
  })
})