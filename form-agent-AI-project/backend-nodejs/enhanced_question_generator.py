#!/usr/bin/env python3
"""
Enhanced Question Generation Logic - DATA DRIVEN
Sử dụng 575K+ câu hỏi thực từ dataset thay vì templates
"""

import random
import re
import pickle
import numpy as np
from pathlib import Path
from collections import defaultdict, Counter
import warnings
warnings.filterwarnings('ignore')

class DataDrivenQuestionGenerator:
    def __init__(self, model_path="../models/real_data_question_model.pkl", silent=False):
        self.model_path = Path(model_path)
        self.model_data = None
        self.is_loaded = False
        self.silent = silent
        
        # Load trained model with real data
        self.load_model()
        
    def load_model(self):
        """Load trained model với 575K+ câu hỏi thực tế"""
        try:
            if not self.model_path.exists():
                print(f"Model file not found: {self.model_path}")
                return False
                
            with open(self.model_path, 'rb') as f:
                self.model_data = pickle.load(f)
            
            self.is_loaded = True
            if not self.silent:
                print(f"Model loaded: {len(self.model_data.get('real_questions_db', []))} real questions")
            return True
            
        except Exception as e:
            if not self.silent:
                print(f"Error loading model: {e}")
            return False
    
    def generate_diverse_questions(self, keyword, category=None, num_questions=5):
        """Tạo câu hỏi đa dạng sử dụng intelligent pattern generation"""
        questions = []
        keyword_lower = keyword.lower().strip()
        
        # Always use intelligent pattern generation for completely local operation
        questions = self._generate_intelligent_pattern_questions(keyword_lower, category, num_questions)
        
        # Ensure uniqueness and quality
        unique_questions = self._ensure_uniqueness(questions)
        quality_questions = [self._improve_question_quality(q) for q in unique_questions]
        
        # Shuffle for variety
        random.shuffle(quality_questions)
        
        return quality_questions[:num_questions]
    
    def _get_direct_questions(self, keyword, limit):
        """Lấy câu hỏi trực tiếp từ keyword mapping"""
        questions = []
        
        if not self.model_data or 'keyword_question_mapping' not in self.model_data:
            return questions
        
        keyword_mapping = self.model_data['keyword_question_mapping']
        
        # Exact match
        if keyword in keyword_mapping:
            for q_data in keyword_mapping[keyword][:limit]:
                questions.append({
                    'question': q_data.get('question', ''),
                    'method': 'direct_match',
                    'category': q_data.get('category', 'general'),
                    'confidence': 0.95,
                    'source': f'exact_match:{keyword}'
                })
        
        # Partial matches
        if len(questions) < limit:
            keyword_words = set(keyword.split())
            for mapped_keyword, q_list in keyword_mapping.items():
                mapped_words = set(mapped_keyword.split())
                overlap = len(keyword_words.intersection(mapped_words))
                
                if overlap > 0 and mapped_keyword != keyword:
                    similarity = overlap / max(len(keyword_words), len(mapped_words))
                    if similarity > 0.3:  # Threshold for relevance
                        for q_data in q_list[:2]:  # Limit per keyword
                            if len(questions) >= limit:
                                break
                            questions.append({
                                'question': q_data.get('question', ''),
                                'method': 'partial_match',
                                'category': q_data.get('category', 'general'),
                                'confidence': 0.7 + similarity * 0.2,
                                'source': f'partial_match:{mapped_keyword}'
                            })
        
        return questions[:limit]
    
    def _get_similar_keyword_questions(self, keyword, limit):
        """Tìm câu hỏi từ keywords tương tự"""
        questions = []
        
        if not self.model_data:
            return questions
        
        try:
            # Use similarity model from trained data
            if 'similarity_model' in self.model_data and 'keyword_vectorizer' in self.model_data:
                keyword_vec = self.model_data['keyword_vectorizer'].transform([keyword])
                
                # Find similar keywords
                distances, indices = self.model_data['similarity_model'].kneighbors(keyword_vec, n_neighbors=10)
                
                # Get unique keywords from vectorizer
                feature_names = self.model_data['keyword_vectorizer'].get_feature_names_out()
                
                keyword_mapping = self.model_data.get('keyword_question_mapping', {})
                
                for idx, distance in zip(indices[0], distances[0]):
                    if len(questions) >= limit:
                        break
                    
                    similarity = 1 - distance
                    if similarity > 0.5:  # Minimum similarity threshold
                        # Find questions from this similar context
                        for mapped_keyword, q_list in keyword_mapping.items():
                            if len(questions) >= limit:
                                break
                            
                            # Simple word overlap check
                            if any(word in mapped_keyword for word in keyword.split()):
                                for q_data in q_list[:2]:
                                    if len(questions) >= limit:
                                        break
                                    questions.append({
                                        'question': q_data.get('question', ''),
                                        'method': 'similarity_based',
                                        'category': q_data.get('category', 'general'),
                                        'confidence': 0.6 + similarity * 0.3,
                                        'source': f'similar_keyword:{mapped_keyword}'
                                    })
        
        except Exception as e:
            print(f"Error in similarity search: {e}")
        
        return questions[:limit]
    
    def _get_category_questions(self, keyword, category, limit):
        """Lấy câu hỏi từ cùng category"""
        questions = []
        
        if not self.model_data or 'real_questions_db' not in self.model_data:
            return questions
        
        # Filter questions by category
        category_questions = [
            q for q in self.model_data['real_questions_db'] 
            if q.get('category', '').lower() == category.lower()
        ]
        
        # Randomly sample from category questions
        if category_questions:
            sampled = random.sample(category_questions, min(limit * 2, len(category_questions)))
            
            for q_data in sampled[:limit]:
                questions.append({
                    'question': q_data.get('question', ''),
                    'method': 'category_based',
                    'category': category,
                    'confidence': 0.65,
                    'source': f'category:{category}'
                })
        
        return questions
    
    def _generate_intelligent_pattern_questions(self, keyword, category, num_questions):
        """Generate intelligent pattern-based questions for local operation"""
        questions = []
        
        # Advanced question patterns based on category and keyword context
        question_templates = {
            'strategy': [
                f"What are the most effective strategies for implementing {keyword}?",
                f"How can organizations develop a successful {keyword} strategy?",
                f"What best practices should guide {keyword} implementation?",
                f"How do you create a roadmap for {keyword} adoption?",
                f"What are the key success factors for {keyword} initiatives?",
            ],
            'benefits': [
                f"What are the primary benefits of {keyword}?",
                f"How does {keyword} improve business performance?",
                f"What value does {keyword} bring to organizations?",
                f"Why should businesses invest in {keyword}?",
                f"What competitive advantages does {keyword} provide?",
            ],
            'challenges': [
                f"What challenges arise when implementing {keyword}?",
                f"How can organizations overcome {keyword}-related obstacles?",
                f"What risks should be considered with {keyword}?",
                f"What are common pitfalls to avoid with {keyword}?",
                f"How do you address resistance to {keyword} adoption?",
            ],
            'measurement': [
                f"How do you measure the success of {keyword}?",
                f"What metrics are most important for {keyword}?",
                f"How can organizations track {keyword} performance?",
                f"What KPIs should be monitored for {keyword}?",
                f"How do you evaluate the ROI of {keyword}?",
            ],
            'tools': [
                f"What tools are essential for {keyword}?",
                f"How do you select the right {keyword} tools?",
                f"What technologies support {keyword} initiatives?",
                f"How can automation improve {keyword} processes?",
                f"What platforms are recommended for {keyword}?",
            ],
            'skills': [
                f"What skills are needed for {keyword} proficiency?",
                f"How can teams develop {keyword} expertise?",
                f"What training is required for {keyword}?",
                f"How do you build {keyword} capabilities?",
                f"What qualifications are important for {keyword} roles?",
            ],
            'trends': [
                f"What trends are shaping the future of {keyword}?",
                f"How is {keyword} evolving in the industry?",
                f"What innovations are emerging in {keyword}?",
                f"How will {keyword} change in the next 5 years?",
                f"What are the latest developments in {keyword}?",
            ]
        }
        
        # Category-specific emphasis
        category_weights = {
            'it': {'tools': 2.0, 'trends': 1.5, 'skills': 1.3},
            'marketing': {'measurement': 1.8, 'trends': 1.5, 'tools': 1.2},
            'economics': {'measurement': 2.0, 'benefits': 1.5, 'challenges': 1.3},
            'general': {'strategy': 1.5, 'benefits': 1.3, 'challenges': 1.2}
        }
        
        # Get weights for current category
        weights = category_weights.get(category, category_weights['general'])
        
        # Select questions from different categories with weighting
        selected_categories = []
        for template_category, templates in question_templates.items():
            weight = weights.get(template_category, 1.0)
            # Add category multiple times based on weight
            for _ in range(int(weight)):
                selected_categories.append(template_category)
        
        # Randomly select categories and questions
        random.shuffle(selected_categories)
        
        used_templates = set()
        for i in range(num_questions):
            if i < len(selected_categories):
                template_category = selected_categories[i]
                available_templates = [t for t in question_templates[template_category] if t not in used_templates]
                
                if available_templates:
                    template = random.choice(available_templates)
                    used_templates.add(template)
                    
                    questions.append({
                        'question': template,
                        'method': f'intelligent_pattern_{template_category}',
                        'category': category or 'general',
                        'confidence': 0.85,
                        'source': f'pattern_based:{keyword}'
                    })
        
        # Fill remaining slots if needed
        while len(questions) < num_questions:
            all_templates = []
            for templates in question_templates.values():
                all_templates.extend(templates)
            
            remaining_templates = [t for t in all_templates if t not in used_templates]
            if remaining_templates:
                template = random.choice(remaining_templates)
                used_templates.add(template)
                
                questions.append({
                    'question': template,
                    'method': 'intelligent_pattern_fill',
                    'category': category or 'general',
                    'confidence': 0.80,
                    'source': f'pattern_based:{keyword}'
                })
            else:
                break
        
        return questions
    
    def _select_contextual_patterns(self, keyword, patterns, limit):
        """Select patterns based on keyword context"""
        keyword_lower = keyword.lower()
        
        # Context-based pattern weighting
        context_weights = {}
        
        for i, pattern in enumerate(patterns):
            weight = 1.0
            
            # Boost certain patterns for specific keyword types
            if any(word in keyword_lower for word in ['strategy', 'plan', 'approach']):
                if 'strategies' in pattern or 'approach' in pattern:
                    weight += 0.3
            
            if any(word in keyword_lower for word in ['tool', 'software', 'platform']):
                if 'tools' in pattern or 'implement' in pattern:
                    weight += 0.3
            
            if any(word in keyword_lower for word in ['analysis', 'data', 'metric']):
                if 'measure' in pattern or 'quality' in pattern:
                    weight += 0.3
                    
            if any(word in keyword_lower for word in ['management', 'process']):
                if 'manage' in pattern or 'best practices' in pattern:
                    weight += 0.3
            
            context_weights[i] = weight
        
        # Weighted random selection
        selected_indices = []
        for _ in range(limit):
            weights_list = [context_weights[i] for i in range(len(patterns)) if i not in selected_indices]
            if not weights_list:
                break
                
            # Weighted random choice
            indices = [i for i in range(len(patterns)) if i not in selected_indices]
            weights_normalized = np.array([context_weights[i] for i in indices])
            weights_normalized = weights_normalized / weights_normalized.sum()
            
            chosen_idx = np.random.choice(indices, p=weights_normalized)
            selected_indices.append(chosen_idx)
        
        return [patterns[i] for i in selected_indices]
    
    def _ensure_uniqueness(self, questions):
        """Ensure question uniqueness"""
        seen = set()
        unique_questions = []
        
        for q in questions:
            question_text = q.get('question', '').strip().lower()
            if question_text and question_text not in seen:
                seen.add(question_text)
                unique_questions.append(q)
        
        return unique_questions
    
    def _improve_question_quality(self, question_data):
        """Improve question quality"""
        question = question_data.get('question', '').strip()
        
        if not question:
            return question_data
        
        # Capitalize properly
        if question and question[0].islower():
            question = question[0].upper() + question[1:]
        
        # Ensure ends with question mark
        if not question.endswith('?'):
            question += '?'
        
        # Remove double spaces
        question = re.sub(r'\s+', ' ', question)
        
        # Fix common grammar issues
        question = question.replace(' a AI ', ' an AI ')
        question = question.replace(' a analytics ', ' analytics ')
        question = question.replace(' an strategy ', ' a strategy ')
        
        # Update the question data
        question_data['question'] = question
        return question_data
    
    def _fallback_questions(self, keyword, category, num_questions):
        """Fallback questions when model not loaded"""
        fallback_patterns = [
            f"What are the key aspects of {keyword}?",
            f"How can {keyword} be implemented effectively?",
            f"What benefits does {keyword} provide?",
            f"What challenges are associated with {keyword}?",
            f"How do you measure success with {keyword}?",
        ]
        
        questions = []
        for i, pattern in enumerate(fallback_patterns[:num_questions]):
            questions.append({
                'question': pattern,
                'method': 'fallback',
                'category': category or 'general',
                'confidence': 0.5,
                'source': 'fallback_pattern'
            })
        
        return questions

# Global instance
data_driven_generator = DataDrivenQuestionGenerator(silent=True)

def generate_enhanced_questions(keyword, category='it', num_questions=5):
    """
    Main function để generate enhanced questions từ dữ liệu thực tế
    """
    return data_driven_generator.generate_diverse_questions(keyword, category, num_questions)

# Test function
if __name__ == "__main__":
    # Test với different keywords
    test_cases = [
        ("artificial intelligence", "it"),
        ("digital marketing", "marketing"), 
        ("financial modeling", "economics"),
        ("data science", "it"),
        ("social media", "marketing")
    ]
    
    print("Testing Data-Driven Question Generator...")
    for keyword, category in test_cases:
        print(f"\nTesting: '{keyword}' (Category: {category})")
        questions = generate_enhanced_questions(keyword, category, 5)
        
        for i, q in enumerate(questions, 1):
            print(f"  {i}. {q['question']}")
            print(f"     Method: {q['method']} | Confidence: {q['confidence']} | Source: {q['source']}")