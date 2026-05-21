package com.taskmanager.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.queues.task-assigned}")
    private String taskAssignedQueue;

    @Value("${rabbitmq.queues.task-overdue}")
    private String taskOverdueQueue;

    @Value("${rabbitmq.exchanges.task-events}")
    private String taskEventsExchange;

    @Value("${rabbitmq.routing-keys.task-assigned}")
    private String taskAssignedRoutingKey;

    @Value("${rabbitmq.routing-keys.task-overdue}")
    private String taskOverdueRoutingKey;

    // Queues
    @Bean
    public Queue taskAssignedQueue() {
        return QueueBuilder.durable(taskAssignedQueue)
                .withArgument("x-dead-letter-exchange", taskEventsExchange + ".dlx")
                .build();
    }

    @Bean
    public Queue taskOverdueQueue() {
        return QueueBuilder.durable(taskOverdueQueue).build();
    }

    // Exchange
    @Bean
    public TopicExchange taskEventsExchange() {
        return ExchangeBuilder.topicExchange(taskEventsExchange).durable(true).build();
    }

    // Dead Letter Exchange
    @Bean
    public DirectExchange deadLetterExchange() {
        return ExchangeBuilder.directExchange(taskEventsExchange + ".dlx").durable(true).build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(taskAssignedQueue + ".dlq").build();
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue()).to(deadLetterExchange()).with(taskAssignedQueue);
    }

    // Bindings
    @Bean
    public Binding taskAssignedBinding(Queue taskAssignedQueue, TopicExchange taskEventsExchange) {
        return BindingBuilder.bind(taskAssignedQueue).to(taskEventsExchange).with(taskAssignedRoutingKey);
    }

    @Bean
    public Binding taskOverdueBinding(Queue taskOverdueQueue, TopicExchange taskEventsExchange) {
        return BindingBuilder.bind(taskOverdueQueue).to(taskEventsExchange).with(taskOverdueRoutingKey);
    }

    // Message converter
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter());
        factory.setDefaultRequeueRejected(false); // send failures to DLQ
        factory.setConcurrentConsumers(2);
        factory.setMaxConcurrentConsumers(5);
        return factory;
    }
}
