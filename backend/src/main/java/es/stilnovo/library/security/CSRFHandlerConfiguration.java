package es.stilnovo.library.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CSRFHandlerConfiguration: Manages CSRF token injection for server-side rendered templates.
 * 
 * Registers a custom interceptor that extracts the CSRF token from the request
 * and adds it to the Spring model for template rendering (Mustache views).
 * 
 * This ensures all form submissions include a valid CSRF token for protection
 * against cross-site request forgery attacks.
 */
@Configuration
public class CSRFHandlerConfiguration implements WebMvcConfigurer {

	/**
	 * Registers the CSRF token handler interceptor in the request processing chain.
	 * @param registry the interceptor registry
	 */
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(new CSRFHandlerInterceptor());
	}
}

/**
 * CSRFHandlerInterceptor: Injects CSRF tokens into model view for template rendering.
 */
class CSRFHandlerInterceptor implements HandlerInterceptor {

	/**
	 * Called after request processing; extracts CSRF token and adds to model.
	 * Mustache templates access token via ${token} for form submissions.
	 * 
	 * @param request the HTTP request
	 * @param response the HTTP response
	 * @param handler the executed handler
	 * @param modelAndView the model and view returned by handler (may be null)
	 * @throws Exception if token injection fails
	 */
	@Override
	public void postHandle(final HttpServletRequest request, final HttpServletResponse response, final Object handler,
			final ModelAndView modelAndView) throws Exception {

		if (modelAndView != null) {

			CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
			if (token != null) {
				modelAndView.addObject("token", token.getToken());
			}
		}
	}
}
