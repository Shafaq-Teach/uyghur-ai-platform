import { NextRequest } from 'next/server';
import { supabase } from './supabase';

export interface AdminAuthResult {
  authorized: boolean;
  user?: any;
  error?: string;
}

export interface UserCoinsAuthResult {
  authorized: boolean;
  isUsingOwnKey?: boolean;
  user?: any;
  remainingCoins?: number;
  status?: number;
  error?: string;
  message?: string;
}

/**
 * Verifies whether the request comes from an authenticated Admin
 */
export async function verifyAdmin(req: NextRequest): Promise<AdminAuthResult> {
  try {
    // 1. Secret admin key header check
    const adminSecret = req.headers.get('x-admin-key');
    if (adminSecret && (adminSecret === 'sensiz520' || adminSecret === process.env.ADMIN_SECRET_KEY)) {
      return { authorized: true };
    }

    // 2. Bearer access token check
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'باشقۇرغۇچى كىملىكى تېپىلمىدى (401 Unauthorized)' };
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return { authorized: false, error: 'ئۈنۈمسىز ئاچقۇچ بەلگىسى' };
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return { authorized: false, error: 'جەريان ۋاقتى ئۆتكەن ياكى ئىناۋەتسىز' };
    }

    // Primary admin email
    if (user.email?.toLowerCase() === 'yulgun353@gmail.com') {
      return { authorized: true, user };
    }

    // Check role in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      return { authorized: true, user };
    }

    return { authorized: false, error: 'باشقۇرغۇچى ھوقۇقى يوق' };
  } catch (err: any) {
    return { authorized: false, error: err.message || 'باشقۇرغۇچى دەلىللەش كاشىلىسى' };
  }
}

/**
 * Verifies user session and deducts coins server-side if using the master platform keys
 */
export async function verifyUserAndDeductCoins(
  req: NextRequest,
  cost: number,
  userProvidedKey?: string
): Promise<UserCoinsAuthResult> {
  // If the user supplied their own valid personal key (>10 chars), allow free execution without platform coins
  if (userProvidedKey && userProvidedKey.trim().length > 10) {
    return { authorized: true, isUsingOwnKey: true };
  }

  // Master key usage requires valid authenticated user
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      status: 401,
      error: 'AUTH_REQUIRED',
      message: 'سۈنئى ئەقىل مۇلازىمەتلىرىنى ئىشلىتىش ئۈچۈن ئالدى بىلەن سىستېمىغا كىرىڭ ياكى تىزىملىتىڭ!',
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return {
      authorized: false,
      status: 401,
      error: 'AUTH_REQUIRED',
      message: 'سۈنئى ئەقىل مۇلازىمەتلىرىنى ئىشلىتىش ئۈچۈن سىستېمىغا كىرىڭ.',
    };
  }

  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return {
        authorized: false,
        status: 401,
        error: 'INVALID_SESSION',
        message: 'جەريان ئۈزۈلۈپ قالدى، قايتا كىرىڭ.',
      };
    }

    // Master Admin is immune from coin deductions
    if (user.email?.toLowerCase() === 'yulgun353@gmail.com') {
      return { authorized: true, user, remainingCoins: 9999 };
    }

    // Call atomic PostgreSQL deduct_user_coins function
    const { data: deductRes, error: deductErr } = await supabase.rpc('deduct_user_coins', {
      user_uuid: user.id,
      cost: cost,
    });

    if (deductErr) {
      return {
        authorized: false,
        status: 400,
        error: 'DEDUCTION_FAILED',
        message: deductErr.message || 'تەڭگە ئېلىش مەغلۇپ بولدى',
      };
    }

    if (!deductRes || deductRes.success === false) {
      return {
        authorized: false,
        status: 402,
        error: 'INSUFFICIENT_COINS',
        message: deductRes?.error || `تەڭگىڭىز يېتەرلىك ئەمەس! بۇ مۇلازىمەتكە ${cost} تەڭگە كېتىدۇ.`,
      };
    }

    return {
      authorized: true,
      user,
      remainingCoins: deductRes.remaining_coins,
    };
  } catch (err: any) {
    return {
      authorized: false,
      status: 500,
      error: 'AUTH_ERROR',
      message: err.message || 'دەلىللەش جەريانىدا كاشىلا كۆرۈلدى',
    };
  }
}
