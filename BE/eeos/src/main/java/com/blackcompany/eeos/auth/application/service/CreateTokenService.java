package com.blackcompany.eeos.auth.application.service;

import com.blackcompany.eeos.auth.application.domain.TokenModel;
import com.blackcompany.eeos.auth.application.domain.converter.TokenModelConverter;
import com.blackcompany.eeos.auth.application.domain.token.TokenProvider;
import com.blackcompany.eeos.auth.application.domain.token.TokenResolver;
import com.blackcompany.eeos.auth.persistence.AuthInfoEntity;
import com.blackcompany.eeos.auth.persistence.AuthInfoEntityConverter;
import com.blackcompany.eeos.auth.persistence.AuthInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CreateTokenService {
	private final TokenProvider tokenProvider;
	private final TokenModelConverter tokenModelConverter;
	private final TokenResolver tokenResolver;
	private final AuthInfoRepository authInfoRepository;
	private final AuthInfoEntityConverter authInfoEntityConverter;

	@Transactional
	public TokenModel execute(final Long memberId) {
		String accessToken = tokenProvider.createAccessToken(memberId);
		String refreshToken = tokenProvider.createRefreshToken(memberId);

		saveToken(memberId, refreshToken);

		return tokenModelConverter.from(
				accessToken,
				tokenResolver.getExpiredDateByHeader(accessToken),
				refreshToken,
				tokenResolver.getExpiredDateByCookie(refreshToken));
	}

	private void saveToken(final Long memberId, final String token) {
		AuthInfoEntity authInfoEntity = authInfoEntityConverter.from(memberId, token);
		authInfoRepository.save(authInfoEntity);
	}
}
