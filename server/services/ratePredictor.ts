
interface ShipmentFeatures {
  weight: number;
  distance: number;
  serviceType: string;
  season: string;
  fuelPrice: number;
}

export class RatePredictor {
  private weights = {
    weight: 2.5,
    distance: 0.1,
    serviceMultiplier: {
      'express': 1.5,
      'standard': 1.0,
      'economy': 0.8
    },
    seasonMultiplier: {
      'peak': 1.2,
      'normal': 1.0,
      'off-peak': 0.9
    },
    fuelSurcharge: 0.15
  };

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if ([10, 11, 0].includes(month)) return 'peak'; // Nov-Jan
    if ([6, 7].includes(month)) return 'off-peak'; // Jul-Aug
    return 'normal';
  }

  public predictRate(features: ShipmentFeatures): number {
    const baseRate = features.weight * this.weights.weight +
                    features.distance * this.weights.distance;
    
    const serviceMultiplier = this.weights.serviceMultiplier[features.serviceType] || 1.0;
    const seasonMultiplier = this.weights.seasonMultiplier[features.season] || 1.0;
    const fuelSurcharge = features.fuelPrice * this.weights.fuelSurcharge;
    
    return baseRate * serviceMultiplier * seasonMultiplier + fuelSurcharge;
  }

  public async updateWeights(actualRates: Array<{features: ShipmentFeatures, rate: number}>): Promise<void> {
    // Implement simple gradient descent to update weights based on actual rates
    const learningRate = 0.01;
    for (const {features, rate} of actualRates) {
      const predicted = this.predictRate(features);
      const error = predicted - rate;
      
      this.weights.weight -= learningRate * error * features.weight;
      this.weights.distance -= learningRate * error * features.distance;
    }
  }
}
