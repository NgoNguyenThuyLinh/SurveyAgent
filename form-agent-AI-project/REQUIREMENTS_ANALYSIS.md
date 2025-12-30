# REQUIREMENTS ANALYSIS - FORM AGENT AI SYSTEM
## Phân Tích Yêu Cầu Chi Tiết

**Ngày:** 14/12/2025  
**Phiên bản:** 1.0  
**Dự án:** Form Agent AI - Hệ thống tự động tạo form và câu hỏi dựa trên AI

---

## 1. EXECUTIVE SUMMARY

Form Agent AI là một hệ thống phức tạp sử dụng Machine Learning để tự động:
- Phân loại keywords vào 3 lĩnh vực: IT, Economics, Marketing
- Tạo câu hỏi thông minh từ keywords
- Tạo form hoàn chỉnh với fields, validation rules và logic phức tạp

Hệ thống được training trên dataset khổng lồ (target 500 triệu records) và sử dụng nhiều ML models để đạt độ chính xác cao.

---

## 2. FUNCTIONAL REQUIREMENTS (Yêu Cầu Chức Năng)

### 2.1. Keyword Classification (Phân loại Keyword)

**FR-1.1: Category Prediction**
- **Mô tả:** Hệ thống phải tự động phân loại keyword vào 1 trong 3 categories: IT, Economics, Marketing
- **Input:** Keyword (string, 1-200 characters)
- **Output:** 
  - Predicted category (string)
  - Confidence score (float, 0-1)
  - Probabilities for all categories (dict)
- **Thuật toán:** 
  - TF-IDF Vectorization (max_features: 5000, ngram_range: 1-2)
  - Random Forest Classifier hoặc Logistic Regression
  - Accuracy requirement: > 90%
- **API Endpoint:** `POST /api/predict-category`
- **Use Cases:**
  - Người dùng nhập "machine learning" → System trả về IT (95% confidence)
  - Người dùng nhập "stock market" → System trả về Economics (92% confidence)

**FR-1.2: Category Hint Override**
- **Mô tả:** Cho phép user override category prediction bằng hint
- **Input:** 
  - Keyword (string)
  - category_hint (optional: "it" | "economics" | "marketing")
- **Business Logic:** Nếu category_hint được cung cấp, ưu tiên hint hơn prediction

### 2.2. Question Generation (Tạo Câu Hỏi)

**FR-2.1: ML-Based Question Generation**
- **Mô tả:** Tạo câu hỏi từ keyword sử dụng ML similarity search
- **Input:**
  - Keyword (string)
  - num_questions (int, 1-20, default: 5)
  - category_hint (optional string)
- **Output:** List of questions, mỗi question có:
  - question (string)
  - category (string)
  - confidence (float)
  - similarity (float)
  - source ("ml_similarity" | "template")
- **ML Components:**
  - TF-IDF Vectorizer cho keywords (max_features: 5000)
  - TF-IDF Vectorizer cho questions (max_features: 10000, ngram: 1-3)
  - NearestNeighbors model (n_neighbors: 10, metric: cosine)
  - Question adaptation algorithm
- **API Endpoint:** `POST /api/generate-questions`

**FR-2.2: Advanced Question Adaptation**
- **Mô tả:** Adapt existing questions cho new keywords một cách thông minh
- **Algorithm:**
  1. Find similar keywords trong training data
  2. Retrieve questions của similar keywords
  3. Replace original keyword với target keyword
  4. Maintain question structure và grammar
  5. Score quality of adapted questions
- **Example:**
  - Original: "What is Python programming?"
  - Similar keyword: "Java programming"
  - Target: "JavaScript programming"
  - Adapted: "What is JavaScript programming?"

**FR-2.3: Pattern Learning (NO TEMPLATES!)**
- **Mô tả:** Advanced Question AI học patterns từ data thực, KHÔNG dùng hard-coded templates
- **Components:**
  - Pattern extractor từ question dataset
  - LDA Topic Modeling
  - Question type detector (What, How, Why, Definition, etc.)
  - Cosine similarity matching
- **Training Source:** Real question datasets từ `question_datasets/` folder

**FR-2.4: Batch Question Generation**
- **Mô tả:** Generate questions cho multiple keywords một lúc
- **Input:** List of keywords (array)
- **Output:** Map of keyword → questions
- **Performance:** Xử lý parallel khi có thể
- **API Endpoint:** `POST /api/batch-generate`

### 2.3. Form Generation (Tạo Form)

**FR-3.1: Form Type Prediction**
- **Mô tả:** Predict loại form phù hợp với keyword
- **Form Types:**
  - Survey (khảo sát)
  - Registration (đăng ký)
  - Feedback (phản hồi)
  - Application (đơn ứng tuyển)
  - Order (đặt hàng)
  - Contact (liên hệ)
  - Assessment (đánh giá)
- **Input:** Keyword + Category
- **Output:** Form type + confidence score
- **ML Model:** Random Forest classifier cho mỗi category

**FR-3.2: Complexity Analysis**
- **Mô tả:** Phân tích độ phức tạp của form cần tạo
- **Complexity Levels:**
  - Simple: 5-8 fields, 3-5 minutes
  - Moderate: 8-15 fields, 5-10 minutes
  - Complex: 15-30+ fields, 10-20 minutes
- **Factors:**
  - Number of words in keyword
  - Industry-specific indicators
  - Form type
  - Data type requirements
- **Output:** 
  - Complexity level (enum)
  - Estimated field count (int)
  - Estimated completion time (minutes)

**FR-3.3: Field Generation**
- **Mô tả:** Tự động tạo form fields với proper types và validations
- **Field Types Supported:**
  - text, email, password, number, tel, url
  - date, time, datetime-local
  - textarea, select, checkbox, radio
  - range, file, hidden
- **Field Properties:**
  - id, name, label, type
  - placeholder, description
  - required (boolean)
  - validation_rules (array)
  - options (for select/radio/checkbox)
  - default_value (optional)
- **Generation Logic:**
  - Basic fields (name, email, phone) - always include
  - Category-specific fields (IT: experience, skills; Economics: income; Marketing: budget)
  - Intent-based fields (survey: rating scales; registration: password)
  - Advanced fields based on complexity

**FR-3.4: Validation Rules Generation**
- **Mô tả:** Tạo validation rules cho từng field
- **Validation Types:**
  - required (boolean)
  - minLength, maxLength (string)
  - min, max (number)
  - pattern (regex for email, phone, etc.)
  - custom validation functions
- **Patterns:**
  - Email: RFC 5322 compliant
  - Phone: International format support
  - URL: http/https validation
  - Date: ISO 8601 format

**FR-3.5: Form Structure Generation**
- **Mô tả:** Tạo complete form structure với metadata
- **Output Structure:**
```json
{
  "form_id": "unique_id",
  "title": "Generated title",
  "description": "Form purpose",
  "category": "it|economics|marketing",
  "form_type": "survey|registration|...",
  "complexity": "simple|moderate|complex",
  "estimated_time": 5,
  "fields": [...],
  "styling": {...},
  "validation_rules": {...},
  "metadata": {...}
}
```

### 2.4. Data Management

**FR-4.1: Form Submission**
- **Mô tả:** Lưu trữ responses từ generated forms
- **Storage:** SQLite database (SQLAlchemy ORM)
- **Tables:**
  - users: User accounts
  - generated_forms: Form definitions
  - form_submissions: User responses
  - form_analytics: Statistics
- **Validation:** Server-side validation theo rules đã define

**FR-4.2: Form Template Management**
- **Mô tả:** Lưu và quản lý form templates
- **Features:**
  - Save generated forms as templates
  - Reuse templates cho similar keywords
  - Version control cho templates
  - Archive old templates

**FR-4.3: Analytics & Reporting**
- **Mô tả:** Track usage và performance metrics
- **Metrics:**
  - Form generation count by category
  - Most used keywords
  - Average complexity distribution
  - API response times
  - Model accuracy tracking
  - User engagement metrics

### 2.5. Dataset Generation & Training

**FR-5.1: Massive Dataset Generation**
- **Mô tả:** Generate training data at scale
- **Target:** 500,000,000 records
- **Components:**
  - dataset_generator.py: Main generator
  - simple_dataset_generator.py: Quick prototyping
  - question_generator.py: Question-specific data
- **Output Format:** CSV files in batches (100K records/batch)
- **Batch Processing:** Memory-efficient streaming
- **Data Fields:**
  - keyword, category, form_type, complexity
  - form_title, form_description
  - field_name, field_type, validation_rules
  - target_audience, use_case, industry_vertical

**FR-5.2: Model Training Pipeline**
- **Mô tả:** Complete training pipeline trong Jupyter Notebook
- **Steps:**
  1. Load CSV batches với memory management
  2. Data cleaning & preprocessing
  3. Feature engineering (TF-IDF, statistical features)
  4. Train/test split (80/20, stratified)
  5. Model training (multiple algorithms)
  6. Cross-validation
  7. Model evaluation & comparison
  8. Save best model với pickle
- **Notebook:** Complete_Dataset_Training.ipynb
- **Models Trained:**
  - Category classifier
  - Form type classifier (per category)
  - Complexity analyzer
  - Question similarity model

**FR-5.3: Model Versioning**
- **Mô tả:** Version control cho trained models
- **Metadata Stored:**
  - training_date
  - model_type (algorithm name)
  - accuracy, f1_score, confusion_matrix
  - training_samples count
  - feature_count
  - hyperparameters
- **File Format:** 
  - Models: .pkl (pickle)
  - Metadata: .json

### 2.6. API & Integration

**FR-6.1: RESTful API**
- **Framework:** FastAPI (Python) + Express.js (Node.js)
- **Ports:**
  - FastAPI: 8000
  - Node.js: 8001
  - Question API: configurable
- **API Documentation:**
  - OpenAPI (Swagger) auto-generated
  - Interactive docs at `/docs`
  - ReDoc at `/redoc`

**FR-6.2: Python-Node.js Bridge**
- **Mô tả:** Communication giữa Node.js backend và Python ML models
- **Implementation:** PythonBridgeService
- **Method:** Child process spawn
- **Features:**
  - Process pooling
  - Request queuing
  - Error handling & retry
  - Timeout management
  - Memory leak prevention

**FR-6.3: CORS & Security**
- **CORS:** Configurable allowed origins
- **Rate Limiting:** Express rate-limit middleware
- **Security Headers:** Helmet.js
- **Input Validation:** Pydantic models (FastAPI), Joi (Node.js)
- **API Authentication:** JWT tokens (future)

**FR-6.4: PDF Generation**
- **Mô tả:** Export generated forms to PDF
- **Library:** Python PDF libraries
- **Features:**
  - Professional formatting
  - Company branding support
  - Print-optimized layout

---

## 3. NON-FUNCTIONAL REQUIREMENTS (Yêu Cầu Phi Chức Năng)

### 3.1. Performance Requirements

**NFR-1.1: Response Time**
- **Category Prediction:** < 100ms (average)
- **Question Generation (5 questions):** < 500ms
- **Form Generation:** < 800ms
- **Batch Processing (10 keywords):** < 3 seconds
- **Model Loading:** < 5 seconds on startup

**NFR-1.2: Throughput**
- **API Requests:** Support 100 requests/second minimum
- **Concurrent Users:** 50+ simultaneous users
- **Dataset Processing:** 100K records/batch without memory overflow

**NFR-1.3: Resource Usage**
- **Memory:** 
  - Python backend: < 2GB under normal load
  - Node.js backend: < 512MB
  - Model files: ~50-200MB total
- **CPU:** Efficient use, support multi-core processing
- **Disk I/O:** Minimize disk reads with caching

### 3.2. Scalability Requirements

**NFR-2.1: Horizontal Scaling**
- Architecture supports multiple API server instances
- Load balancer ready
- Stateless API design

**NFR-2.2: Model Scaling**
- Support model updates without downtime
- A/B testing capability for model versions
- Gradual rollout of new models

**NFR-2.3: Data Scaling**
- Support 500M+ training records
- Batch processing architecture
- Incremental training capability

### 3.3. Reliability & Availability

**NFR-3.1: Uptime**
- **Target:** 99.5% uptime
- **Downtime:** Planned maintenance windows only
- **Recovery:** Auto-restart on crash

**NFR-3.2: Error Handling**
- Graceful degradation
- Fallback to template-based generation if ML fails
- Comprehensive error messages
- Logging all errors

**NFR-3.3: Data Integrity**
- No data loss on form submissions
- Database transactions (ACID compliance)
- Regular backups

### 3.4. Accuracy & Quality

**NFR-4.1: Model Accuracy**
- **Category Classification:** > 90% accuracy
- **Question Relevance:** > 85% user satisfaction
- **Form Appropriateness:** > 80% usability score

**NFR-4.2: Question Quality**
- Questions must be grammatically correct
- Questions must be relevant to keyword
- No duplicate questions in same response
- Varied question types

**NFR-4.3: Form Quality**
- All fields must have proper validation
- Forms must be logically structured
- Field order must make sense
- Professional appearance

### 3.5. Usability Requirements

**NFR-5.1: API Usability**
- Clear, RESTful endpoint design
- Consistent response formats
- Comprehensive documentation
- Example requests/responses

**NFR-5.2: Frontend Usability**
- Responsive design (mobile + desktop)
- Intuitive interface
- Real-time preview of generated forms
- Loading indicators for async operations

**NFR-5.3: Developer Experience**
- Clear code structure
- Comprehensive comments
- Easy local setup (< 15 minutes)
- Environment configuration via .env files

### 3.6. Maintainability

**NFR-6.1: Code Quality**
- Modular architecture
- Separation of concerns
- DRY (Don't Repeat Yourself) principle
- Type hints (Python), TypeScript (Node.js)

**NFR-6.2: Testing**
- Unit tests for critical functions
- Integration tests for API endpoints
- Model evaluation scripts
- Performance benchmarking

**NFR-6.3: Documentation**
- README files in each major directory
- Inline code comments
- API documentation (OpenAPI)
- Architecture diagrams (DrawIO)

**NFR-6.4: Monitoring & Logging**
- Structured logging (JSON format)
- Log levels (DEBUG, INFO, WARNING, ERROR)
- Performance metrics collection
- Error tracking

### 3.7. Portability & Compatibility

**NFR-7.1: Platform Support**
- **OS:** Windows, Linux, macOS
- **Python:** 3.8+
- **Node.js:** 14+
- **Browsers:** Chrome, Firefox, Safari, Edge (latest 2 versions)

**NFR-7.2: Deployment**
- Docker support
- Cloud-ready (AWS, Azure, GCP)
- Environment-based configuration
- Production vs Development modes

### 3.8. Security Requirements

**NFR-8.1: Input Validation**
- All user inputs must be validated
- SQL injection prevention (ORM)
- XSS prevention
- CSRF protection (future)

**NFR-8.2: Data Privacy**
- No sensitive data in logs
- Password hashing (bcrypt)
- Secure database credentials
- GDPR compliance considerations (future)

**NFR-8.3: API Security**
- HTTPS only in production
- Rate limiting per IP
- API key authentication (future)
- Request size limits

---

## 4. DATA REQUIREMENTS

### 4.1. Training Data

**DR-1.1: Dataset Size**
- **Target:** 500,000,000 records
- **Current:** ~100+ CSV files in batches
- **Growth:** Continuous expansion

**DR-1.2: Data Quality**
- No duplicates (based on keyword+question)
- Valid categories only (it, economics, marketing)
- Question length: 10-200 characters
- Keyword length: 1-200 characters
- Clean, normalized text

**DR-1.3: Data Distribution**
- Balanced across 3 categories (30-35% each)
- Varied form types within each category
- Different complexity levels represented
- Real-world question patterns

### 4.2. Storage Requirements

**DR-2.1: CSV Storage**
- Location: `datasets/` and `question_datasets/`
- Format: UTF-8 encoded CSV
- Compression: Optional gzip for archival
- Estimated size: 50-100GB total

**DR-2.2: Model Storage**
- Location: `models/`
- Format: Pickle (.pkl) for Python objects
- Size: 50-200MB per model
- Versioning: Timestamp-based or semantic versioning

**DR-2.3: Database Storage**
- Engine: SQLite (development), PostgreSQL (production recommended)
- Size: Scales with form submissions
- Backup: Daily automated backups

### 4.3. Data Flow

```
Dataset Generation → CSV Files → Training Pipeline → Models → API Serving → Inference → User Response
```

---

## 5. TECHNICAL CONSTRAINTS

### 5.1. Technology Stack Constraints

**TC-1.1: Languages**
- **Backend ML:** Python 3.8+ (required for sklearn, pandas)
- **Backend API:** Node.js 14+ OR Python FastAPI
- **Frontend:** React.js (optional, HTML/CSS/JS also supported)

**TC-1.2: Libraries**
- **ML:** scikit-learn, pandas, numpy
- **API:** FastAPI, Express.js
- **Database:** SQLAlchemy (ORM), sqlite3
- **Serialization:** pickle, joblib

### 5.2. Infrastructure Constraints

**TC-2.1: Development Environment**
- Windows, Linux, or macOS
- Minimum 8GB RAM
- 10GB free disk space
- Python + Node.js installed

**TC-2.2: Production Environment**
- Linux server (recommended)
- 16GB+ RAM
- 50GB+ SSD storage
- Multi-core CPU (4+ cores)

### 5.3. Integration Constraints

**TC-3.1: Python-Node.js Communication**
- Must use child_process.spawn (not exec for security)
- JSON-based message passing
- Error handling for process crashes
- Timeout handling (30s default)

**TC-3.2: Model Loading**
- Models loaded once on server startup
- In-memory caching
- Lazy loading option for optional models

---

## 6. ASSUMPTIONS & DEPENDENCIES

### 6.1. Assumptions

**A-1.1: User Input**
- Users provide meaningful keywords (not random strings)
- Keywords are in English or Vietnamese
- Keywords are business/professional context

**A-1.2: Training Data**
- Training data quality is sufficient
- Datasets are representative of real use cases
- No major data bias issues

**A-1.3: Usage Patterns**
- Most users generate 1-5 questions per request
- Forms are primarily used for business purposes
- English is primary language (Vietnamese secondary)

### 6.2. Dependencies

**D-1.1: External Libraries**
- scikit-learn (ML algorithms)
- FastAPI or Express.js (API framework)
- pandas, numpy (data processing)
- SQLAlchemy (database ORM)

**D-1.2: System Dependencies**
- Python 3.8+ runtime
- Node.js 14+ runtime (if using Node.js backend)
- pip, npm package managers

**D-1.3: Development Tools**
- Jupyter Notebook (for training)
- VS Code or similar IDE
- Git (version control)
- DrawIO (architecture diagrams)

---

## 7. SUCCESS CRITERIA

### 7.1. MVP (Minimum Viable Product) Success

**MVP-1: Core Functionality**
- ✅ Category prediction working with >85% accuracy
- ✅ Question generation producing relevant questions
- ✅ Form generation creating usable forms
- ✅ API endpoints responding correctly
- ✅ Basic frontend for testing

**MVP-2: Performance**
- ✅ Response time < 1 second for typical requests
- ✅ No memory leaks or crashes
- ✅ Handle 10+ concurrent users

### 7.2. Production-Ready Success

**PROD-1: Quality**
- Category accuracy >90%
- Question relevance >85%
- Form usability score >80%
- Zero critical bugs

**PROD-2: Scalability**
- Support 100+ concurrent users
- Handle 500M+ training records
- API uptime 99.5%

**PROD-3: Documentation**
- Complete API documentation
- Architecture diagrams
- Setup guides
- User manuals

---

## 8. RISKS & MITIGATIONS

### 8.1. Technical Risks

**RISK-1: Model Accuracy**
- **Description:** Models may not achieve target accuracy
- **Impact:** High - affects core functionality
- **Mitigation:** 
  - Use ensemble methods
  - Increase training data size
  - Fine-tune hyperparameters
  - Implement fallback to template-based generation

**RISK-2: Performance Bottlenecks**
- **Description:** ML inference may be too slow
- **Impact:** Medium - affects user experience
- **Mitigation:**
  - Model optimization (feature reduction)
  - Caching frequently used predictions
  - Async processing for batch requests
  - Horizontal scaling

**RISK-3: Memory Issues**
- **Description:** Large datasets may cause memory overflow
- **Impact:** High - can crash server
- **Mitigation:**
  - Batch processing with size limits
  - Streaming data loading
  - Garbage collection optimization
  - Monitoring memory usage

### 8.2. Data Risks

**RISK-4: Training Data Quality**
- **Description:** Poor quality data leads to poor models
- **Impact:** High - affects all predictions
- **Mitigation:**
  - Data validation pipeline
  - Manual data review samples
  - Outlier detection and removal
  - Continuous data quality monitoring

**RISK-5: Data Imbalance**
- **Description:** Uneven distribution across categories
- **Impact:** Medium - biased predictions
- **Mitigation:**
  - Stratified sampling
  - Class weights in training
  - SMOTE or oversampling techniques
  - Regular distribution monitoring

### 8.3. Integration Risks

**RISK-6: Python-Node.js Bridge Failures**
- **Description:** Inter-process communication may fail
- **Impact:** Medium - API requests fail
- **Mitigation:**
  - Robust error handling
  - Process restart mechanism
  - Fallback to direct Python API
  - Health check endpoints

---

## 9. FUTURE ENHANCEMENTS (Out of Scope for MVP)

### 9.1. Advanced Features

**FUTURE-1: Multi-language Support**
- Support for Vietnamese, Spanish, Chinese
- Language-specific models
- Translation services integration

**FUTURE-2: Custom Templates**
- User-defined form templates
- Template marketplace
- Import/export templates

**FUTURE-3: Real-time Collaboration**
- Multiple users editing same form
- WebSocket communication
- Version control and merge conflicts

### 9.2. ML Improvements

**FUTURE-4: Deep Learning Models**
- BERT/GPT for question generation
- Transformer-based category classification
- Neural form generation

**FUTURE-5: Active Learning**
- User feedback loop
- Incremental model updates
- Online learning from production data

**FUTURE-6: Recommendation System**
- Suggest related questions
- Recommend form structures
- Best practices suggestions

### 9.3. Platform Features

**FUTURE-7: User Accounts & Authentication**
- JWT authentication
- OAuth integration (Google, GitHub)
- User profiles and preferences

**FUTURE-8: Advanced Analytics**
- Dashboard with visualizations
- A/B testing framework
- Conversion tracking
- User behavior analysis

**FUTURE-9: Mobile Apps**
- Native iOS/Android apps
- Progressive Web App (PWA)
- Offline support

---

## 10. APPENDIX

### 10.1. Glossary

- **TF-IDF:** Term Frequency-Inverse Document Frequency, text vectorization technique
- **Sklearn:** Scikit-learn, Python ML library
- **ORM:** Object-Relational Mapping
- **API:** Application Programming Interface
- **CSV:** Comma-Separated Values
- **JWT:** JSON Web Token
- **CORS:** Cross-Origin Resource Sharing
- **LDA:** Latent Dirichlet Allocation, topic modeling algorithm
- **NLP:** Natural Language Processing

### 10.2. References

- [Scikit-learn Documentation](https://scikit-learn.org/stable/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Express.js Documentation](https://expressjs.com/)
- [SQLAlchemy Documentation](https://www.sqlalchemy.org/)
- [React Documentation](https://react.dev/)

### 10.3. Document History

| Version | Date       | Author | Changes                          |
|---------|------------|--------|----------------------------------|
| 1.0     | 2025-12-14 | AI     | Initial comprehensive analysis   |

---

**END OF REQUIREMENTS ANALYSIS DOCUMENT**
