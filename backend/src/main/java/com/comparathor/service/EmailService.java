package com.comparathor.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendUserCreationEmail(String to, String plainPassword) {
        System.out.println("📩 Entrando a sendUserCreationEmail - Enviando a: " + to);

        String subject = "Tu cuenta ha sido creada en Comparathor";
        String message = "Bienvenido a Comparathor!\n\n"
                + "Tu cuenta ha sido creada con éxito.\n"
                + "Email: " + to + "\n"
                + "Contraseña: " + plainPassword + "\n\n"
                + "Por favor, cambia tu contraseña después de iniciar sesión.";

        sendEmail(to, subject, message);
    }

    public void sendEmail(String to, String subject, String text) {
        if (mailSender == null) {
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

}
