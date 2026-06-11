import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

type SetValue<T> = Dispatch<SetStateAction<T>>

function readStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue
  }

  try {
    const storedValue = window.localStorage.getItem(key)

    if (!storedValue) {
      return initialValue
    }

    const parsedValue = JSON.parse(storedValue) as unknown

    if (Array.isArray(initialValue) && !Array.isArray(parsedValue)) {
      console.warn(`Brain Stormy ignored malformed local storage for ${key}: expected an array.`)
      return initialValue
    }

    return parsedValue as T
  } catch (error) {
    console.warn(`Brain Stormy reset malformed local storage for ${key}.`, error)
    return initialValue
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue))

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Brain Stormy could not persist ${key} to local storage.`, error)
    }
  }, [key, value])

  return [value, setValue as SetValue<T>] as const
}
