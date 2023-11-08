import { useState } from '#imports'
import { Auth } from '../types'

export function useAuth () {
  return useState('auth').value as Auth
}
