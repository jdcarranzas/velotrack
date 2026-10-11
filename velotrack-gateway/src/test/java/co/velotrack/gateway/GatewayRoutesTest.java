package co.velotrack.gateway;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;

@SpringBootTest(properties = {
        "TALENTMS_URL=http://talentms.test:8081",
        "CAPTURA_URL=http://captura.test:8082"
})
class GatewayRoutesTest {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void registersTalentmsAndCapturaRoutes() {
        List<Route> routes = routeLocator.getRoutes().collectList().block();

        assertThat(routes).extracting(Route::getId)
                .containsExactlyInAnyOrder("talentms-route", "talentms-health-route",
                        "captura-health-route", "captura-route");
        assertThat(routes).filteredOn(route -> route.getId().equals("talentms-route"))
                .singleElement()
                .satisfies(route -> assertThat(route.getUri().toString()).isEqualTo("http://talentms.test:8081"));
        assertThat(routes).filteredOn(route -> route.getId().equals("captura-route"))
                .singleElement()
                .satisfies(route -> assertThat(route.getUri().toString()).isEqualTo("http://captura.test:8082"));
    }
}
