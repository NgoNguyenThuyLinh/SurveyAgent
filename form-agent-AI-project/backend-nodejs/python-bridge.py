#!/usr/bin/env python3
"""
Python Bridge for Node.js Backend
Uses enhanced data-driven question generation
"""

import sys
import json
import warnings
import traceback
import pickle
from pathlib import Path
from datetime import datetime

warnings.filterwarnings('ignore')

# Import enhanced question generator
try:
    from enhanced_question_generator import generate_enhanced_questions, data_driven_generator
except ImportError:
    print("❌ Could not import enhanced_question_generator")
    sys.exit(1)

class PythonModelBridge:
    def __init__(self, model_path):
        self.model_path = Path(model_path)
        self.model_data = None
        self.is_loaded = False
        
        # Check if enhanced generator is available
        self.enhanced_generator_available = True
        try:
            # Test the enhanced generator
            test_result = data_driven_generator.is_loaded
            self.is_loaded = test_result or True  # Enhanced generator works even without model
        except:
            self.enhanced_generator_available = False
            self.is_loaded = False
        
    def load_model(self):
        """Load the trained model or use enhanced generator"""
        try:
            # For completely local operation, always use enhanced generator
            if self.enhanced_generator_available:
                self.is_loaded = True
                return {
                    "success": True,
                    "message": "Enhanced data-driven generator ready (local mode)",
                    "model_info": {"type": "enhanced_generator", "data_driven": True, "local_mode": True}
                }
            
            # Only try traditional model if enhanced generator is not available
            if self.model_path.exists():
                try:
                    with open(self.model_path, 'rb') as f:
                        self.model_data = pickle.load(f)
                        self.is_loaded = True
                        return {
                            "success": True,
                            "message": "Traditional model loaded successfully",
                            "model_info": self.model_data.get('model_info', {})
                        }
                except Exception as pickle_error:
                    # If pickle loading fails, still use enhanced generator
                    if self.enhanced_generator_available:
                        self.is_loaded = True
                        return {
                            "success": True,
                            "message": "Enhanced generator ready (fallback from pickle error)",
                            "model_info": {"type": "enhanced_generator", "data_driven": True, "pickle_error": str(pickle_error)}
                        }
                    raise pickle_error
            
            return {
                "success": False,
                "error": f"Neither model file found nor enhanced generator available: {self.model_path}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to load model: {str(e)}",
                "traceback": traceback.format_exc()
            }
    
    def get_health_status(self):
        """Get health status of the model"""
        # Always try to initialize if not loaded
        if not self.is_loaded and self.enhanced_generator_available:
            self.is_loaded = True
            
        return {
            "status": "ok",
            "model_loaded": self.is_loaded,
            "enhanced_generator": self.enhanced_generator_available,
            "timestamp": datetime.now().isoformat(),
            "model_path": str(self.model_path)
        }
    
    def get_model_info(self):
        """Get detailed model information"""
        if not self.is_loaded:
            return {
                "success": False,
                "error": "Model not loaded"
            }
        
        try:
            if self.model_data:
                # Traditional model info
                model_info = self.model_data.get('model_info', {})
                return {
                    "success": True,
                    "model_loaded": True,
                    "type": "traditional",
                    "training_date": self.model_data.get('training_date'),
                    "total_keywords": model_info.get('total_keywords', 0),
                    "total_questions": model_info.get('total_questions', 0),
                    "categories": model_info.get('categories', [])
                }
            else:
                # Enhanced generator info
                return {
                    "success": True,
                    "model_loaded": True,
                    "type": "enhanced_generator",
                    "data_driven": True,
                    "categories": ["it", "marketing", "economics", "general"]
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def predict_category(self, keyword):
        """Predict category for a keyword"""
        if not self.is_loaded:
            return {
                "success": False,
                "error": "Model not loaded"
            }
        
        try:
            # If traditional model is available, use it
            if self.model_data:
                # Get model components
                question_vectorizer = self.model_data.get('question_vectorizer')
                category_classifier = self.model_data.get('category_classifier')
                label_encoder = self.model_data.get('label_encoder')
                
                if not all([question_vectorizer, category_classifier, label_encoder]):
                    return self._predict_category_enhanced(keyword)
                
                # Vectorize keyword
                keyword_vec = question_vectorizer.transform([keyword])
                
                # Predict
                prediction = category_classifier.predict(keyword_vec)[0]
                probabilities = category_classifier.predict_proba(keyword_vec)[0]
                
                # Get category name
                predicted_category = label_encoder.inverse_transform([prediction])[0]
                confidence = float(max(probabilities))
                
                # Get all probabilities
                all_probabilities = {}
                for i, prob in enumerate(probabilities):
                    category_name = label_encoder.inverse_transform([i])[0]
                    all_probabilities[category_name] = float(prob)
                
                return {
                    "success": True,
                    "keyword": keyword,
                    "predicted_category": predicted_category,
                    "confidence": confidence,
                    "all_probabilities": all_probabilities
                }
            else:
                return self._predict_category_enhanced(keyword)
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
    
    def _predict_category_enhanced(self, keyword):
        """Enhanced category prediction using simple rules"""
        keyword_lower = keyword.lower()
        
        # Simple rule-based category prediction
        it_keywords = ['technology', 'software', 'programming', 'computer', 'data', 'ai', 'artificial intelligence', 
                      'machine learning', 'cloud', 'database', 'algorithm', 'coding', 'development', 'tech']
        marketing_keywords = ['marketing', 'advertising', 'brand', 'promotion', 'campaign', 'social media', 
                             'content', 'seo', 'digital', 'customer']
        economics_keywords = ['economics', 'finance', 'business', 'investment', 'profit', 'cost', 'budget', 
                             'market', 'economy', 'financial']
        
        # Check keyword matches
        it_score = sum(1 for word in it_keywords if word in keyword_lower)
        marketing_score = sum(1 for word in marketing_keywords if word in keyword_lower)
        economics_score = sum(1 for word in economics_keywords if word in keyword_lower)
        
        scores = {
            'it': it_score,
            'marketing': marketing_score, 
            'economics': economics_score
        }
        
        predicted_category = max(scores.keys(), key=lambda k: scores[k])
        max_score = scores[predicted_category]
        
        # Default to 'general' if no clear match
        if max_score == 0:
            predicted_category = 'general'
            confidence = 0.5
        else:
            confidence = min(0.8, 0.5 + (max_score * 0.1))
        
        return {
            "success": True,
            "keyword": keyword,
            "predicted_category": predicted_category,
            "confidence": confidence,
            "all_probabilities": {
                'it': scores['it'] * 0.2,
                'marketing': scores['marketing'] * 0.2,
                'economics': scores['economics'] * 0.2,
                'general': 0.4 if max_score == 0 else 0.1
            }
        }
    
    def generate_questions(self, keyword, num_questions=5, category=None):
        """Generate questions using enhanced data-driven approach"""
        if not self.is_loaded:
            return {
                "success": False,
                "error": "Model not loaded"
            }
        
        try:
            # Use enhanced question generator with real data
            questions = generate_enhanced_questions(
                keyword=keyword,
                category=category or 'general', 
                num_questions=num_questions
            )
            
            # Format for API response
            formatted_questions = []
            for q in questions:
                formatted_questions.append({
                    'question': q.get('question', ''),
                    'category': q.get('category', 'general'),
                    'confidence': float(q.get('confidence', 0.5)),
                    'method': q.get('method', 'unknown'),
                    'source_keyword': q.get('source', ''),
                    'similarity_score': None
                })
            
            return {
                'success': True,
                'questions': formatted_questions,
                'keyword': keyword,
                'total_generated': len(formatted_questions),
                'execution_time': 0.1  # Placeholder
            }
            
        except Exception as e:
            print(f"❌ Error generating questions: {e}")
            return {
                'success': False,
                'questions': [],
                'keyword': keyword,
                'error': str(e),
                'total_generated': 0,
                'execution_time': 0
            }
    
def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command provided"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    # Check if second argument is a model path or the first real argument
    model_path = "../models/real_data_question_model.pkl"  # default
    start_arg_index = 2
    
    if len(sys.argv) > 2:
        # If second argument looks like a file path, use it as model path
        second_arg = sys.argv[2]
        if second_arg.endswith('.pkl') or second_arg.startswith('/') or second_arg.startswith('../') or ':' in second_arg:
            model_path = second_arg
            start_arg_index = 3
        # Otherwise, keep default model path and start reading args from index 2
    
    # Initialize bridge
    bridge = PythonModelBridge(model_path)
    
    # Load model if not health check
    if command != "health":
        load_result = bridge.load_model()
        if not load_result.get("success"):
            print(json.dumps(load_result))
            sys.exit(1)
    
    # Handle commands
    try:
        if command == "health":
            result = bridge.get_health_status()
        
        elif command == "info":
            # Always try to load model for info command
            load_result = bridge.load_model()
            result = bridge.get_model_info()
        
        elif command == "predict":
            if len(sys.argv) < start_arg_index + 1:
                result = {"success": False, "error": "Keyword required for prediction"}
            else:
                keyword = sys.argv[start_arg_index]
                result = bridge.predict_category(keyword)
        
        elif command == "generate":
            if len(sys.argv) < start_arg_index + 1:
                result = {"success": False, "error": "Keyword required for generation"}
            else:
                keyword = sys.argv[start_arg_index]
                # Default values
                num_questions = 5
                category = None
                
                # Parse remaining arguments
                for i in range(start_arg_index + 1, len(sys.argv)):
                    arg = sys.argv[i]
                    try:
                        # Try to parse as number
                        num_questions = int(arg)
                    except ValueError:
                        # If not a number, treat as category
                        category = arg
                        
                result = bridge.generate_questions(keyword, num_questions, category)
        
        else:
            result = {"success": False, "error": f"Unknown command: {command}"}
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()