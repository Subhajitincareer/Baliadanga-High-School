import React from 'react'
import AdminLogin from './AdminLogin'

describe('<AdminLogin />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AdminLogin />)
  })
})