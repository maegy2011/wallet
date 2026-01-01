/**
 * Production-ready Captcha System
 * Generates and validates text-based captchas for admin authentication
 */

import crypto from 'crypto';

export interface CaptchaData {
  id: string;
  text: string;
  question: string;
}

export class CaptchaService {
  private static captchaStore = new Map<string, { text: string; expires: number }>();
  
  /**
   * Generate a simple math captcha
   */
  static generateCaptcha(): CaptchaData {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer: number;
    let question: string;
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }

    const id = crypto.randomBytes(16).toString('hex');
    const expires = Date.now() + (5 * 60 * 1000); // 5 minutes expiration

    // Store captcha data
    this.captchaStore.set(id, {
      text: answer.toString(),
      expires
    });

    // Clean up expired captchas
    this.cleanupExpiredCaptchas();

    return {
      id,
      text: answer.toString(),
      question
    };
  }

  /**
   * Generate a random string captcha
   */
  static generateStringCaptcha(length: number = 6): CaptchaData {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const id = crypto.randomBytes(16).toString('hex');
    const expires = Date.now() + (5 * 60 * 1000); // 5 minutes expiration

    // Store captcha data
    this.captchaStore.set(id, {
      text: result,
      expires
    });

    // Clean up expired captchas
    this.cleanupExpiredCaptchas();

    return {
      id,
      text: result,
      question: `Enter the following text: ${result}`
    };
  }

  /**
   * Verify captcha answer
   */
  static verifyCaptcha(id: string, answer: string): boolean {
    const storedCaptcha = this.captchaStore.get(id);
    
    if (!storedCaptcha) {
      return false;
    }

    // Check if expired
    if (Date.now() > storedCaptcha.expires) {
      this.captchaStore.delete(id);
      return false;
    }

    // Verify answer (case insensitive for string captchas, exact for math)
    const isValid = storedCaptcha.text.toLowerCase() === answer.toLowerCase();
    
    // Remove captcha after verification (one-time use)
    if (isValid) {
      this.captchaStore.delete(id);
    }

    return isValid;
  }

  /**
   * Clean up expired captchas
   */
  private static cleanupExpiredCaptchas(): void {
    const now = Date.now();
    for (const [id, captcha] of this.captchaStore.entries()) {
      if (now > captcha.expires) {
        this.captchaStore.delete(id);
      }
    }
  }

  /**
   * Get captcha statistics
   */
  static getStats(): { total: number; active: number } {
    this.cleanupExpiredCaptchas();
    const now = Date.now();
    const active = Array.from(this.captchaStore.values()).filter(
      captcha => now <= captcha.expires
    ).length;
    
    return {
      total: this.captchaStore.size,
      active
    };
  }

  /**
   * Clear all captchas (for testing)
   */
  static clearAll(): void {
    this.captchaStore.clear();
  }
}