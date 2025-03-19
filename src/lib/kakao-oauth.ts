export class KakaoOAuth {
  static getSignInUrl(): string {
    const url = "https://kauth.kakao.com/oauth/authorize";
    const params = new URLSearchParams({
      client_id: process.env.KAKAO_REST_API_KEY!,
      redirect_uri: process.env.KAKAO_REDIRECT_URI!,
      response_type: "code",
    });
    return `${url}?${params.toString()}`;
  }

  static async fetchAccessToken(
    code: string,
    redirect_uri?: string,
  ): Promise<{
    access_token: string;
    access_token_expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
  }> {
    const url = "https://kauth.kakao.com/oauth/token";
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_REST_API_KEY!,
      redirect_uri: redirect_uri || process.env.KAKAO_REDIRECT_URI!,
      client_secret: process.env.KAKAO_CLIENT_SECRET!,
      code,
    });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: params.toString(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch access token");
    }
    const data = await response.json();

    return {
      access_token: data.access_token,
      access_token_expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      refresh_token_expires_in: data.refresh_token_expires_in,
    };
  }

  static async fetchUserProfile(accessToken: string): Promise<{
    id: string;
    nickname: string;
    profile_image: string;
  }> {
    const url = "https://kapi.kakao.com/v2/user/me?secure_resource=true";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }
    const data = await response.json();
    return {
      id: data.id,
      nickname: data.kakao_account.profile.nickname,
      profile_image: data.kakao_account.profile.profile_image_url,
    };
  }
}
