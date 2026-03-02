# Test Runner Skill

## Description
Write and run tests across languages and frameworks.

## When to Use
- When you need to create unit tests, integration tests, or end-to-end tests
- When you need to run existing test suites
- When you need to debug failing tests
- When you need to generate test coverage reports

## Commands
### Python Testing
```bash
# Run pytest
pytest tests/

# Run specific test file
pytest tests/test_example.py

# Run with coverage
pytest --cov=src tests/
```

### JavaScript/Node.js Testing
```bash
# Run Jest tests
npm test

# Run specific test
npm test -- --testNamePattern="specific test"

# Run with coverage
npm test -- --coverage
```

### Java Testing
```bash
# Run JUnit tests with Maven
mvn test

# Run specific test class
mvn test -Dtest=TestClass

# Run with coverage (JaCoCo)
mvn test jacoco:report
```

## Best Practices
- Always write tests before implementing new features (TDD)
- Keep tests small and focused on single responsibilities
- Use descriptive test names that explain what is being tested
- Mock external dependencies to keep tests fast and reliable
- Run tests regularly as part of CI/CD pipeline

## Integration
This skill works well with:
- coding-agent: for implementing the code being tested
- git-essentials: for committing test files
- docker-essentials: for running tests in isolated environments