import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, Play, Target, TrendingUp, AlertTriangle, CheckCircle, Download } from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import { ProductData, CalculationResults } from '../App'

interface TimelineEstimatorProps {
  data: ProductData
  results: CalculationResults | null
}

export default function TimelineEstimator({ data, results }: TimelineEstimatorProps) {
  if (!results) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <CalendarDays className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600">Complete calculations to see timeline estimation</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const today = new Date()
  const productionStartDate = today
  const estimatedCompletionDate = addDays(today, Math.ceil(results.estimatedDays))
  
  // Calculate if there's a deadline conflict
  const hasDeadline = data.deadline
  const deadlineConflict = hasDeadline && data.deadline && differenceInDays(data.deadline, estimatedCompletionDate) < 0
  const daysToDeadline = hasDeadline && data.deadline ? differenceInDays(data.deadline, today) : null

  // Production phases
  const totalUnitsNeeded = results.totalPalletsNeeded * results.totalUnitsPerPallet
  const phases = [
    {
      name: 'Production Setup',
      duration: 1,
      percentage: 5,
      color: 'bg-blue-500',
      units: 0
    },
    {
      name: 'Production Phase 1',
      duration: Math.ceil(results.estimatedDays * 0.4),
      percentage: 40,
      color: 'bg-green-500',
      units: Math.floor(totalUnitsNeeded * 0.4)
    },
    {
      name: 'Production Phase 2',
      duration: Math.ceil(results.estimatedDays * 0.4),
      percentage: 40,
      color: 'bg-yellow-500',
      units: Math.floor(totalUnitsNeeded * 0.4)
    },
    {
      name: 'Final Production & QC',
      duration: Math.ceil(results.estimatedDays * 0.2),
      percentage: 15,
      color: 'bg-purple-500',
      units: totalUnitsNeeded - Math.floor(totalUnitsNeeded * 0.8)
    }
  ]

  // Daily milestones
  const dailyMilestones = Array.from({ length: Math.min(7, Math.ceil(results.estimatedDays)) }, (_, i) => {
    const day = i + 1
    const cumulativeUnits = Math.min(day * results.dailyProduction, totalUnitsNeeded)
    const progressPercentage = (cumulativeUnits / totalUnitsNeeded) * 100
    const palletProgress = cumulativeUnits / results.totalUnitsPerPallet
    
    return {
      day,
      date: addDays(today, i),
      cumulativeUnits,
      progressPercentage,
      palletProgress,
      isWorkingDay: (i % 7) < data.workingDays
    }
  })

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num))
  }

  const exportTimeline = () => {
    // This would typically generate a PDF or Excel export
    console.log('Exporting timeline...', { data, results, phases, dailyMilestones })
  }

  return (
    <div className="space-y-6">
      {/* Timeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Production Timeline Overview
          </CardTitle>
          <CardDescription>
            Estimated production schedule and milestones
          </CardDescription>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportTimeline}>
              <Download className="w-4 h-4 mr-2" />
              Export Timeline
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.ceil(results.estimatedDays)}</div>
              <div className="text-sm text-blue-800">Total Production Days</div>
              <div className="text-xs text-blue-600 mt-1">
                {(Math.ceil(results.estimatedDays) / 7 * data.workingDays).toFixed(1)} working days
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.dailyProduction}</div>
              <div className="text-sm text-green-800">Daily Production Rate</div>
              <div className="text-xs text-green-600 mt-1">units per working day</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(totalUnitsNeeded)}</div>
              <div className="text-sm text-purple-800">Total Units Required</div>
              <div className="text-xs text-purple-600 mt-1">across {results.totalPalletsNeeded} pallets</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {format(estimatedCompletionDate, 'MMM dd')}
              </div>
              <div className="text-sm text-orange-800">Estimated Completion</div>
              <div className="text-xs text-orange-600 mt-1">
                {format(estimatedCompletionDate, 'yyyy')}
              </div>
            </div>
          </div>

          {/* Deadline Alert */}
          {hasDeadline && (
            <div className={`p-4 rounded-lg mb-6 ${
              deadlineConflict 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                {deadlineConflict ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <div className={`font-medium ${deadlineConflict ? 'text-red-800' : 'text-green-800'}`}>
                    {deadlineConflict ? 'Schedule Conflict Detected' : 'Timeline Meets Deadline'}
                  </div>
                  <div className={`text-sm ${deadlineConflict ? 'text-red-600' : 'text-green-600'}`}>
                    {deadlineConflict 
                      ? `Production will complete ${Math.abs(daysToDeadline || 0)} days after the deadline`
                      : `Production will complete ${daysToDeadline} days before the deadline`
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production Phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Production Phases
          </CardTitle>
          <CardDescription>
            Breakdown of production stages and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase, index) => {
              let startDay = 1
              for (let i = 0; i < index; i++) {
                startDay += phases[i].duration
              }
              const endDay = startDay + phase.duration - 1
              const startDate = addDays(today, startDay - 1)
              const endDate = addDays(today, endDay - 1)

              return (
                <div key={phase.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${phase.color}`}></div>
                      <h3 className="font-medium">{phase.name}</h3>
                      <Badge variant="outline">
                        {phase.duration} day{phase.duration > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
                    </div>
                  </div>
                  
                  <Progress value={phase.percentage} className="mb-2" />
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatNumber(phase.units)} units</span>
                    <span>{phase.percentage}% of total production</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Daily Production Milestones
          </CardTitle>
          <CardDescription>
            First week production targets and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyMilestones.map((milestone) => (
              <div key={milestone.day} className={`border rounded-lg p-4 ${
                milestone.isWorkingDay ? 'bg-white' : 'bg-gray-50 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                      {milestone.day}
                    </div>
                    <div>
                      <div className="font-medium">
                        Day {milestone.day} - {format(milestone.date, 'EEE, MMM dd')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {milestone.isWorkingDay ? 'Working Day' : 'Non-Working Day'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatNumber(milestone.cumulativeUnits)} units
                    </div>
                    <div className="text-sm text-gray-600">
                      {milestone.palletProgress.toFixed(1)} pallets complete
                    </div>
                  </div>
                </div>
                
                {milestone.isWorkingDay && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>{milestone.progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={milestone.progressPercentage} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Resource Planning
          </CardTitle>
          <CardDescription>
            Production capacity and resource requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Production Capacity */}
            <div>
              <h3 className="font-medium mb-3">Production Capacity Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Current Daily Capacity</span>
                  <span className="font-semibold">{results.dailyProduction} units</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Required Daily Average</span>
                  <span className="font-semibold">
                    {Math.ceil(totalUnitsNeeded / (Math.ceil(results.estimatedDays) * data.workingDays / 7))} units
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Capacity Utilization</span>
                  <span className="font-semibold">
                    {((Math.ceil(totalUnitsNeeded / (Math.ceil(results.estimatedDays) * data.workingDays / 7)) / results.dailyProduction) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-blue-50 px-3 rounded">
                  <span className="font-medium">Spare Capacity</span>
                  <span className="font-bold text-blue-600">
                    {results.dailyProduction - Math.ceil(totalUnitsNeeded / (Math.ceil(results.estimatedDays) * data.workingDays / 7))} units/day
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Optimization */}
            <div>
              <h3 className="font-medium mb-3">Timeline Optimization</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="font-medium text-green-800">Accelerated Schedule</div>
                  <div className="text-sm text-green-600">
                    With {Math.round(results.dailyProduction * 1.2)} units/day: {Math.ceil(totalUnitsNeeded / (results.dailyProduction * 1.2 * data.workingDays / 7))} days
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="font-medium text-blue-800">Current Schedule</div>
                  <div className="text-sm text-blue-600">
                    With {results.dailyProduction} units/day: {Math.ceil(results.estimatedDays)} days
                  </div>
                </div>
                
                <div className="p-3 bg-orange-50 rounded border border-orange-200">
                  <div className="font-medium text-orange-800">Conservative Schedule</div>
                  <div className="text-sm text-orange-600">
                    With {Math.round(results.dailyProduction * 0.8)} units/day: {Math.ceil(totalUnitsNeeded / (results.dailyProduction * 0.8 * data.workingDays / 7))} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            Recommended Actions
          </CardTitle>
          <CardDescription>
            Steps to optimize your production timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deadlineConflict && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">Urgent: Increase Production Capacity</div>
                  <div className="text-sm text-red-600">
                    Consider increasing daily production to {Math.ceil((totalUnitsNeeded / (daysToDeadline || 1)) * 7 / data.workingDays)} units/day to meet deadline
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Setup Production Schedule</div>
                <div className="text-sm text-blue-600">
                  Begin production on {format(productionStartDate, 'EEEE, MMMM do')} with {data.workingDays} working days per week
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Monitor Daily Progress</div>
                <div className="text-sm text-green-600">
                  Track against {results.dailyProduction} units per day target and adjust as needed
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded">
              <Target className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-medium text-purple-800">Quality Control Checkpoints</div>
                <div className="text-sm text-purple-600">
                  Schedule QC reviews at the end of each phase to maintain quality standards
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}