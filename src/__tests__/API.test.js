import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTasks, fetchTask, fetchChildTasks, createTask, updateTask, deleteTask, loginUser, registerUser, getMe, logoutUser, refreshAccessToken } from '../api'

describe('API Functions', () => {
  describe('Task Management', () => {
    it('should have fetchTasks function', () => {
      expect(typeof fetchTasks).toBe('function')
    })

    it('should have fetchTask function', () => {
      expect(typeof fetchTask).toBe('function')
    })

    it('should have fetchChildTasks function', () => {
      expect(typeof fetchChildTasks).toBe('function')
    })

    it('should have createTask function', () => {
      expect(typeof createTask).toBe('function')
    })

    it('should have updateTask function', () => {
      expect(typeof updateTask).toBe('function')
    })

    it('should have deleteTask function', () => {
      expect(typeof deleteTask).toBe('function')
    })
  })

  describe('Authentication', () => {
    it('should have registerUser function', () => {
      expect(typeof registerUser).toBe('function')
    })

    it('should have loginUser function', () => {
      expect(typeof loginUser).toBe('function')
    })

    it('should have getMe function', () => {
      expect(typeof getMe).toBe('function')
    })

    it('should have logoutUser function', () => {
      expect(typeof logoutUser).toBe('function')
    })

    it('should have refreshAccessToken function', () => {
      expect(typeof refreshAccessToken).toBe('function')
    })
  })

  describe('Backward Compatibility', () => {
    it('should export fetchTodos as alias for fetchTasks', () => {
      const { fetchTodos } = require('../api')
      expect(typeof fetchTodos).toBe('function')
    })

    it('should export createTodo as alias for createTask', () => {
      const { createTodo } = require('../api')
      expect(typeof createTodo).toBe('function')
    })

    it('should export updateTodo as alias for updateTask', () => {
      const { updateTodo } = require('../api')
      expect(typeof updateTodo).toBe('function')
    })

    it('should export deleteTodo as alias for deleteTask', () => {
      const { deleteTodo } = require('../api')
      expect(typeof deleteTodo).toBe('function')
    })
  })
})
