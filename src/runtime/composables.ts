import { useState } from '#app'
import { Auth } from '../types'

export function useAuth () {
  return useState('auth').value as Auth
}
