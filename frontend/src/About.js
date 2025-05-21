import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import './App.css';

const About = () => {
  return (
    <Container className="my-5">
      {/* Project Section */}
      <Row className="mb-5">
        <Col lg={12} className="text-center mb-4">
          <h1 className="display-4 mb-4">Game Analytics HUB</h1>
          <p className="lead text-muted">
            Revolutionizing the way gamers explore and analyze gaming industry metrics
          </p>
        </Col>
      </Row>

      {/* About the Platform */}
      <Row className="mb-5">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <h2 className="mb-4">About the Platform</h2>
              <p className="lead">
                Game Analytics HUB is a comprehensive platform designed for gamers and industry enthusiasts to explore
                gaming metrics and share insights about their favorite titles.
              </p>
              <p>
                Our platform leverages cutting-edge technologies and real-time data integration with various gaming APIs
                to provide the most up-to-date information on game releases, ratings, and industry trends.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Developer Section */}
      <Row className="mb-5">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <h2 className="mb-4">About the Developer</h2>
              <Row className="align-items-start">
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="rounded-3 overflow-hidden mx-auto mb-3" style={{ width: '250px', height: '300px', background: '#1a1a1a' }}>
                    <img 
                      src="/samurai.jpg" 
                      alt="Developer" 
                      className="w-100 h-100 object-fit-cover" 
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="h4">Anvesh Gupta</h3>
                  <p className="text-muted">Full Stack Developer</p>
                </Col>
                <Col md={8}>
                  {/* Education Section */}
                  <h4 className="mb-3">Education</h4>
                  <div className="mb-4">
                    <div className="mb-3">
                      <p className="mb-1"><strong>University of Florida</strong></p>
                      <p className="text-muted mb-1">Master of Science - Computer Science</p>
                      <p className="text-muted small">Gainesville, FL, USA • Aug 2023 - May 2025</p>
                    </div>
                    <div>
                      <p className="mb-1"><strong>Thapar Institute of Engineering and Technology</strong></p>
                      <p className="text-muted mb-1">Bachelor of Technology in Electronics and Communication Engineering</p>
                      <p className="text-muted small">Patiala, India • Aug 2019 - Aug 2023</p>
                    </div>
                  </div>

                  {/* Experience Section */}
                  <h4 className="mb-3">Professional Experience</h4>
                  <div className="mb-4">
                    <div className="mb-3">
                      <p className="mb-1"><strong>Software Developer Intern</strong> at Superstars</p>
                      <p className="text-muted small">Aug 2024 – Dec 2024</p>
                      <ul className="text-muted small">
                        <li>Designed and built Admin Portal using HTML, CSS, and Angular</li>
                        <li>Developed cross-platform mobile application using Flutter and Dart</li>
                      </ul>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1"><strong>Software Developer</strong> at Logitech</p>
                      <p className="text-muted small">June 2021 – Dec 2022</p>
                      <ul className="text-muted small">
                        <li>Led development of Warranty Product Registration Portal</li>
                        <li>Improved API response time by 40% through database optimization</li>
                        <li>Integrated Azure DevOps pipelines reducing production bugs by 35%</li>
                      </ul>
                    </div>

                    <div>
                      <p className="mb-1"><strong>UI Designer</strong> at Maskgun</p>
                      <p className="text-muted small">Aug 2020 – Feb 2021</p>
                      <ul className="text-muted small">
                        <li>Led UI redesign increasing player retention by 13%</li>
                        <li>Contributed to marketing campaigns achieving 50M+ downloads</li>
                      </ul>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <h4 className="mb-3">Technical Skills</h4>
                  <div className="mb-2">
                    <h6 className="text-muted mb-2">Cloud Technologies</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Badge bg="primary">Google Cloud Platform</Badge>
                      <Badge bg="primary">Amazon S3</Badge>
                      <Badge bg="primary">AWS Glue</Badge>
                      <Badge bg="primary">Microsoft Azure</Badge>
                    </div>
                  </div>
                  <div className="mb-2">
                    <h6 className="text-muted mb-2">Frontend</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Badge bg="success">React.js</Badge>
                      <Badge bg="success">Next.js</Badge>
                      <Badge bg="success">Angular</Badge>
                      <Badge bg="success">NgRx</Badge>
                      <Badge bg="success">HTML5</Badge>
                      <Badge bg="success">CSS3</Badge>
                      <Badge bg="success">Tailwind CSS</Badge>
                    </div>
                  </div>
                  <div className="mb-2">
                    <h6 className="text-muted mb-2">Backend & Databases</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Badge bg="info">Python (Flask)</Badge>
                      <Badge bg="info">Node.js</Badge>
                      <Badge bg="info">Express</Badge>
                      <Badge bg="info">PostgreSQL</Badge>
                      <Badge bg="info">AWS RDS</Badge>
                      <Badge bg="info">Azure SQL</Badge>
                      <Badge bg="info">NoSQL</Badge>
                    </div>
                  </div>
                  <div>
                    <h6 className="text-muted mb-2">Design Tools</h6>
                    <div className="d-flex flex-wrap gap-2">
                      <Badge bg="secondary">Figma</Badge>
                      <Badge bg="secondary">Adobe Creative Suite</Badge>
                      <Badge bg="secondary">Unity UI</Badge>
                      <Badge bg="secondary">Jira</Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
