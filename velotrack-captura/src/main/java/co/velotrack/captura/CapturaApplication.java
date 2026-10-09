package co.velotrack.captura;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CapturaApplication {
    public static void main(String[] args) {
        SpringApplication.run(CapturaApplication.class, args);
    }
}
